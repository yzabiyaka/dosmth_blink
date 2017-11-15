'use strict';

const logger = require('winston');
const amqp = require('amqplib');

class RabbitMQBroker extends Broker {
  constructor(amqpConfig, clientDescription = false) {
    this.amqpConfig = amqpConfig;
    this.clientDescription = clientDescription;
    this.connection = false;
    this.channel = false;
  }

  async connect() {

  }

  toString() {
    if (!this.connection) {
      return 'Not connected';
    }
    // Todo: log actual amqpconfig?
    return JSON.stringify(RabbitMQConnection.getNetworkData(this.connection));
  }

}

module.exports = RabbitMQBroker;
