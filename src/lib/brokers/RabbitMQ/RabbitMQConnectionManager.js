'use strict';

// ------- Imports -------------------------------------------------------------

const logger = require('winston');
const amqp = require('amqplib');

// ------- Internal imports ----------------------------------------------------

const BlinkConnectionError = require('../../../errors/BlinkConnectionError');

// ------- Class ---------------------------------------------------------------

class RabbitMQConnectionManager {
  constructor(amqpConfig, clientDescription = false, reconnectManager = false) {
    this.amqpConfig = amqpConfig;
    this.clientDescription = clientDescription;
    this.connection = false;
    this.channel = false;

    // Inject reconnect manager.
    this.reconnectManager = reconnectManager;

    // A lock indicates that connection recovery is in progress.
    // We need this to make sure recovery is happened only once,
    // despite multiple processes can request it asynchronously.
    this.recoveryLock = false;

    // Expose function by binding it to object context.
    this.createActiveChannel = this.createActiveChannel.bind(this);
  }

  async connect() {
    if (!this.reconnectManager) {
      // No reconnection logic provided, just try once and return the result.
      // In this case, auto recovery will be disabled too.
      return this.createActiveChannel();
    }

    // Manage automatic reconnect:
    // 1. Enable automatic reconnects on first connection.
    const result = await this.reconnectManager.reconnect(this.createActiveChannel);
    if (!result) {
      // Even thought reconnect manager will try until it succeed,
      // it could receive an interruption signal to stop trying.
      // In this case, the result will be false.
      return false;
    }
    // 2. Enable automatic recovery on channel or connection failures.
    // RabbitMQ is notorious for killing your channels for obvious reasons,
    // and we want the connection to be persistent.
    this.enableAutoRecovery();
    return true;
  }

  /**
   * Enable automatic recovery on channel or connection failures
   *
   * RabbitMQ is notorious for killing your channels for obvious reasons,
   * and we want the connection to be persistent.
   * Useful for living through RabbitMQ restarts.
   */
  enableAutoRecovery() {
    this.channel.on('close', () => {
      const error = new BlinkConnectionError(
        'AMQP channel got closed, attempting automatic recovery.',
      );
      RabbitMQConnectionManager.logNotice(error);
      this.recoverActiveChannel();
    });
    this.connection.on('close', () => {
      const error = new BlinkConnectionError(
        'AMQP connection got closed, attempting automatic recovery.',
      );
      RabbitMQConnectionManager.logNotice(error);
      this.recoverActiveChannel();
    });
  }

  /**
   * Recover active channel.
   *
   * Because we don't support multiple channels within one connection,
   * to simplify recovery logic, we'll recreate both connection and channel
   * from scratch.
   */
  async recoverActiveChannel() {
    // This may be called asynchronously both on channel failure and
    // connection failure, but we need to execute this only once.
    if (this.recoveryLock) {
      // Another recovery is already in progress.
      return false;
    }
    logger.debug('AMQP automatic recovery in progress', {
      code: 'debug_rabbitmq_connection_manager_recovering_active_channel_started',
    });
    this.recoveryLock = true;

    // Attempt to close what's left of connection and channel.
    await this.disconnect();

    // Reconnect.
    await this.connect();
    this.recoveryLock = false;
    logger.debug('AMQP automatic recovery successfull', {
      code: 'success_rabbitmq_connection_manager_recovering_active_channel_finished',
    });
    return true;
  }

  /**
   * Establish RabbitMQ connection.
   *
   * RabbitMQ connection consist of two parts:
   * - Persistent AMQP connection though TCP/IP
   * - Lightweight channels within the TCP connection
   *
   * Multiple channels are used when there's a need
   * to have multiple inependent connections to AMQP broker.
   *
   * Blink shouldn't need more than one RabbitMQ link, so only one channel
   * within one connection will be managed.
   *
   * @return {bool} Result
   */
  async createActiveChannel() {
    // Establish new RabbitMQ TCP/IP connection.
    let connection;
    try {
      connection = await this.establishTCPConnection();
    } catch (error) {
      RabbitMQConnectionManager.logFailure(error);
      return false;
    }
    // TCP connection established.
    RabbitMQConnectionManager.attachOnErrorLogging(connection);
    // TODO: make sure we can mock that.
    this.connection = connection;

    // Create new communication channel within the connection.
    let channel;
    try {
      channel = await this.createChannelInTCPConnection();
    } catch (error) {
      RabbitMQConnectionManager.logFailure(error);
      return false;
    }
    // Channels created.
    RabbitMQConnectionManager.logSuccess(channel);
    RabbitMQConnectionManager.attachOnErrorLogging(channel);
    this.channel = channel;
    return true;
  }


  async disconnect() {
    // Log request for disconnect.
    logger.debug('AMQP disconnect requested', {
      code: 'debug_rabbitmq_connection_manager_disconnect_requested',
    });

    // If automatic connection in progress, stop it.
    if (this.reconnectManager) {
      await this.reconnectManager.interrupt();
    }
    // Disconnect active channel.
    // Ignore errors if the channels is already closed.
    try {
      await this.channel.close();
    } catch (error) {
      const wrappedError = new BlinkConnectionError(
        `Ignoring: attepmeted closing active channel, but ${error}.`,
      );
      RabbitMQConnectionManager.logNotice(wrappedError);
    }
    this.channel = false;

    // Disconnect its connection.
    try {
      await this.connection.close();
    } catch (error) {
      const wrappedError = new BlinkConnectionError(
        `Ignoring: attepmeted closing active connection, but ${error}.`,
      );
      RabbitMQConnectionManager.logNotice(wrappedError);
    }
    this.connection = false;
    return true;
  }

  getActiveChannel() {
    return this.channel;
  }

  async establishTCPConnection() {
    // Create AMQP connection.
    let connection;
    try {
      connection = await amqp.connect(
        this.amqpConfig,
        this.getClientProperties(),
      );
    } catch (error) {
      // Will throw an error on malformed URI, network problems or other issues.
      // For now, just rethrow wrapped error.
      throw new BlinkConnectionError(`Connectiod failed: ${error}`);
    }

    // Just in case.
    if (!connection) {
      throw new BlinkConnectionError('Unexpected connection null pointer');
    }
    return connection;
  }

  async createChannelInTCPConnection() {
    let channel;
    try {
      // TODO: consider ConfirmChannel?
      channel = await this.connection.createChannel();
    } catch (error) {
      // May fail if there are no more channels available
      // (i.e., if there are already `channelMax` channels open).
      throw new BlinkConnectionError(`Channel creation failed: ${error}`);
    }

    // Just in case.
    if (!channel) {
      throw new BlinkConnectionError('Unexpected channel null pointer');
    }
    return channel;
  }

  getClientProperties() {
    // Additional connection properties to make debugging easier.
    let clientDescription;
    if (!this.clientDescription) {
      clientDescription = {
        name: 'Blink-AMQP',
        version: '0.0.0',
      };
    } else {
      clientDescription = this.clientDescription;
    }

    return {
      clientProperties: { app: clientDescription },
    };
  }

  toString() {
    if (!this.connection || !this.channel) {
      return 'Not connected';
    }
    // Todo: log actual amqpconfig?
    return JSON.stringify(RabbitMQConnectionManager.getNetworkData(this.getActiveChannel()));
  }

  static logSuccess(channel) {
    const networkData = RabbitMQConnectionManager.getNetworkData(channel);
    logger.info('AMQP channel created', {
      code: 'success_rabbitmq_connection_manager_channel_created',
      amqp_local: `${networkData.localAddress}:${networkData.localPort}`,
      amqp_remote: `${networkData.remoteAddress}:${networkData.remotePort}`,
      // TODO: dyno
    });
  }

  static logFailure(error) {
    logger.error(`RabbitMQ connection error: ${error.message}`, {
      code: 'error_rabbitmq_connection_manager_server_error',
    });
  }

  static logNotice(error) {
    logger.debug(`RabbitMQ connection notice: ${error.message}`, {
      code: 'debug_rabbitmq_connection_manager_notice',
    });
  }

  static getNetworkData(channel) {
    // Instance of Duplex.
    const socket = channel.connection.stream;
    return {
      localAddress: socket.localAddress,
      localPort: socket.localPort,
      remoteAddress: socket.remoteAddress,
      remotePort: socket.remotePort,
    };
  }

  static attachOnErrorLogging(eventEmitter) {
    eventEmitter.on('error', RabbitMQConnectionManager.logFailure);
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = RabbitMQConnectionManager;

// ------- End -----------------------------------------------------------------
