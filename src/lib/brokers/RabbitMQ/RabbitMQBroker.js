'use strict';

// ------- Imports -------------------------------------------------------------

// const logger = require('winston');

// ------- Internal imports ----------------------------------------------------

const Broker = require('../Broker');
const DelayLogic = require('../../DelayLogic');
const ReconnectManager = require('../../ReconnectManager');
const RabbitMQConnectionManager = require('./RabbitMQConnectionManager');

// ------- Class ---------------------------------------------------------------

class RabbitMQBroker extends Broker {
  constructor(amqpConfig, clientDescription = false) {
    super();
    // Initialize reconnect manager suitable for RabbitMQ.
    // Anecdotally, Constant time backoff every 2 seconds works best.
    // TODO: confirm if that's true.
    const reconnectManager = new ReconnectManager(
      DelayLogic.constantTimeDelay(2000),
    );

    // TODO: use options array instead of clientDescription.
    this.connectionManager = new RabbitMQConnectionManager(
      amqpConfig,
      clientDescription,
      reconnectManager,
    );

    // AMQP channel.
    this.channel = false;

    // Initialize connection class. By default it's not connected.
    // this.connection = new RabbitMQConnection(this.amqpconfig, this.clientDescription);
    // See connect() description.
    // this.channel = new RabbitMQChannel(this.connection);
  }

  /**
   * Create managed RabbitMQ connection
   */
  async connect() {
    await this.connectionManager.connect();
    this.channel = this.connectionManager.getActiveChannel();
    // TODO: return false when fails?
    return true;
  }

  async disconnect() {
    await this.connectionManager.disconnect();
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = RabbitMQBroker;

// ------- End -----------------------------------------------------------------
