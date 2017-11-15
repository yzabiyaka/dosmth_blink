'use strict';

// ------- Imports -------------------------------------------------------------

const logger = require('winston');
const amqp = require('amqplib');

// ------- Internal imports ----------------------------------------------------

const Broker = require('../Broker');

// ------- Class ---------------------------------------------------------------

class RabbitMQBroker extends Broker {
  constructor(amqpConfig, clientDescription = false) {
    super();
    this.amqpConfig = amqpConfig;
    this.clientDescription = clientDescription;

    // Initialize connection class. By default it's not connected.
    this.connection = new RabbitMQConnection(this.amqpconfig, this.clientDescription);
    // See connect() description.
    this.channel = new RabbitMQChannel(this.connection);
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
    // Create new RabbitMQ connection.
    const connectionResult = await this.connection.connect();
    if (!connectionResult) {
      return false;
    }
    // TODO: enable connection auto reconnect!

    // Create new channel within the connection.
    const channelResult = await this.channel.connect();
    if (!channelResult) {
      return false;
    }
     // TODO: enable channel auto reconnect!
    return true;
  }

  async disconnect() {

  }

  toString() {
    if (!this.connection) {
      return 'Not connected';
    }
    // Todo: log actual amqpconfig?
    return JSON.stringify(RabbitMQConnection.getNetworkData(this.connection));
  }

}

// ------- Exports -------------------------------------------------------------

module.exports = RabbitMQBroker;

// ------- End -----------------------------------------------------------------
