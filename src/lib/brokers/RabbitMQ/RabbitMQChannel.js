'use strict';

const logger = require('winston');

class RabbitMQChannel {
  constructor(connection) {
    this.connection = connection;
    this.channel = false;
  }

  async reconnect() {
    this.create();
  }

  async create() {
    let channel;
    try {
      channel = await this.connection.createChannel();
    } catch (error) {
      RabbitMQChannel.logFailure(error, this.connection);
      return false;
    }

    // Just in case.
    if (!channel) {
      const error = new BlinkConnectionError('Unexpected channel null pointer');
      RabbitMQChannel.logFailure(error, this.connection);
      return false;
    }

    RabbitMQChannel.logSuccess(channel);
    RabbitMQChannel.attachErrorLogging(channel);
    this.channel = channel;
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
