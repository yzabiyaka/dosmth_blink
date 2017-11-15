'use strict';

// ------- Imports -------------------------------------------------------------

const logger = require('winston');
const amqp = require('amqplib');

// ------- Internal imports ----------------------------------------------------

const Broker = require('../Broker');
const RabbitMQConnectionManager = require('./RabbitMQConnectionManager');
// const RabbitMQChannel = require('./RabbitMQChannel');
// const RabbitMQConnection = require('./RabbitMQConnection');

// ------- Class ---------------------------------------------------------------

class RabbitMQBroker extends Broker {
  constructor(amqpConfig, clientDescription = false) {
    super();
    // TODO: use options array instead of clientDescription.
    this.connectionManager = new RabbitMQConnectionManager(amqpConfig, clientDescription);
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
