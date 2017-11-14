'use strict';

const logger = require('winston');
const amqp = require('amqplib');

class Connection {
  constructor(amqpConfig, clientDescription = false) {
    this.amqpConfig = amqpConfig;
    this.clientDescription = clientDescription;
    this.connection = false;
  }

  async reconnect() {
    this.create();
  }

  async create() {
    let connection;
    try {
      connection = await this.establishConnection();
    } catch (error) {
      // TODO: Try to reconnect on network errors?
      Connection.logFailure(error, this.amqpConfig);
      return false;
    }

    // Just in case.
    if (!connection) {
      const error = new BlinkConnectionError('Unexpected connection null pointer');
      Connection.logFailure(error, this.amqpConfig);
      return false;
    }

    Connection.logSuccess(connection);
    Connection.attachErrorLogging(connection);
    this.connection = connection;
  }

  async establishConnection() {
    // Create AMQP connection.
    let connection;
    try {
      connection = await amqp.connect(
        this.amqpConfig,
        this.getClientProperties()
      );
    } catch (error) {
      // Will throw an error on malformed URI, network problems or other issues.
      // For now, just rethrow wrapped error.
      throw new BlinkConnectionError(error.toString());
    }
    return connection;
  }

  async createChannel() {
    let channel;
    try {
      // TODO: consider ConfirmChannel?
      channel = await this.connection.createChannel();
    } catch (error) {
      // May fail if there are no more channels available
      // (i.e., if there are already `channelMax` channels open).
      throw new BlinkConnectionError(error.toString());
    }
    return channel;
  }

  enableAutoReconnect(reconnectManager) {
    this.channel.on('close', (error) => {
      reconnectManager.scheduleReconnect(
        this,
        0,
        'amqp_connection_closed_from_server',
        `Unexpected AMQP connection shutdown: ${error}`,
      );
    });
  }

  toString() {
    if (!this.connection) {
      return 'Not connected';
    }
    // Todo: log actual amqpconfig?
    return JSON.stringify(Connection.getNetworkData(this.connection));
  }

  static attachErrorLogging(connection) {
    connection.on('error', (error) => {
      logger.warning(error.toString(), { code: 'amqp_connection_error' });
    });
  }

  static logSuccess(connection) {
    const networkData = Connection.getNetworkData(connection);
    logger.debug('AMQP connection created', {
      code: 'amqp_connection_created',
      amqp_local: `${socket.localAddress}:${socket.localPort}`,
      amqp_remote: `${socket.remoteAddress}:${socket.remotePort}`,
    });
  }

  static logFailure(error, config) {
    logger.error(`AMQP connection failed: ${error.toString()}`, {
      code: 'amqp_connection_failed',
      amqp: config,
    });
  }

  static getClientProperties() {
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

  static getNetworkData(connection) {
    // Instance of Duplex.
    const socket = connection.stream;
    return {
      localAddress: socket.localAddress,
      localPort: socket.localPort,
      remoteAddress: socket.remoteAddress,
      remoteAddress: socket.remoteAddress,
    }
  }

}

module.exports = Connection;
