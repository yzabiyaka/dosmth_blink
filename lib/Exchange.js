'use strict';

const amqp = require('amqplib');
const amqpUri = require('amqp-uri');

class Exchange {
  constructor(options) {
    this.options = options;
    this.connection = new Promise(resolve => resolve(false));
    this.channel = new Promise(resolve => resolve(false));
  }

  async setup() {
    // Connect
    const uri = amqpUri(this.options);
    this.connection = await amqp.connect(uri);
    this.channel = await this.connection.createChannel();

    // Assert exchange
    const response = await this.channel.assertExchange(
      this.options.exchange,
      'topic'
    );

    // Rabbit echoes exchange name on sucessfull response.
    if (!response.exchange) {
      return false;
    }
    return response.exchange === this.options.exchange;
  }

  async assertQueue() {
    return this;
  }

}

module.exports = Exchange;
