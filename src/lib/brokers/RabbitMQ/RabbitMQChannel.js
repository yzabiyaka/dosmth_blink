'use strict';

const logger = require('winston');

class RabbitMQChannel {
  constructor() {
    this.channel = false;
    this.connection = false;
  }

  async reconnect() {
    // this.create();
  }

  async connect(connection) {
    let channel;
    try {
      channel = await connection.createChannel();
    } catch (error) {
      RabbitMQChannel.logFailure(error, connection);
      return false;
    }

    // Just in case.
    if (!channel) {
      const error = new BlinkConnectionError('Unexpected channel null pointer');
      RabbitMQChannel.logFailure(error, connection);
      return false;
    }

    RabbitMQChannel.logSuccess(channel);
    RabbitMQChannel.attachErrorLogging(channel);
    this.channel = channel;
    this.connection = connection;
  }

  enableAutoReconnect(reconnectManager) {
    this.channel.on('close', (error) => {
      reconnectManager.scheduleReconnect(
        this,
        0,
        'amqp_channel_closed_from_server',
        `Unexpected AMQP channel shutdown: ${error}`,
      );
    });
  }

  static logSuccess(channel) {
    // TODO: get additional channel data?
    logger.debug('AMQP channel created', {
      code: 'amqp_channel_created',
    });
  }

  static logFailure(error, connection) {
    logger.error(`AMQP connection failed: ${error.toString()}`, {
      code: 'amqp_channel_failed',
      connection: connection.toString(),
    });
  }

  static attachErrorLogging(channel) {
    channel.on('error', (error) => {
      logger.warning(error.toString(), { code: 'amqp_channel_error' });
    });
  }
}

module.exports = RabbitMQChannel;
