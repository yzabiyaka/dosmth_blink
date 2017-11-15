'use strict';

// ------- Imports -------------------------------------------------------------

const logger = require('winston');
const amqp = require('amqplib');

// ------- Internal imports ----------------------------------------------------

const BlinkConnectionError = require('../../../errors/BlinkConnectionError');

// ------- Class ---------------------------------------------------------------

class RabbitMQConnectionManager {
  constructor(amqpConfig, clientDescription = false) {
    this.amqpConfig = amqpConfig;
    this.clientDescription = clientDescription;
    this.connection = false;
    this.channel = false;
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
  async connect() {
    // Establish new RabbitMQ TCP/IP connection.
    let connection;
    try {
      connection = await this.establishTCPConnection();
    } catch (error) {
      // TODO: Try to reconnect on network errors?
      RabbitMQConnectionManager.logFailure(error);
      return false;
    }
    // TODO: make sure we can mock that.
    this.connection = connection;

    // Create new communication channel within the connection.
    let channel;
    try {
      channel = await this.createChannelInTCPConnection(connection);
    } catch (error) {
      RabbitMQConnectionManager.logFailure(error);
      return false;
    }

    RabbitMQConnectionManager.logSuccess(channel);
    this.channel = channel;
    return true;
  }


  async disconnect() {
    await this.channel.close();
    await this.connection.close();
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
    logger.debug('AMQP channel created', {
      code: 'amqp_channel_created',
      amqp_local: `${networkData.localAddress}:${networkData.localPort}`,
      amqp_remote: `${networkData.remoteAddress}:${networkData.remotePort}`,
      // TODO: dyno
    });
  }

  static logFailure(error) {
    logger.error(`AMQP channel failed: ${error.toString()}`, {
      code: 'amqp_channel_failed',
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
}

// ------- Exports -------------------------------------------------------------

module.exports = RabbitMQConnectionManager;

// ------- End -----------------------------------------------------------------
