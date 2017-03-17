'use strict';

const amqp = require('amqplib');
const amqpUri = require('amqp-uri');

class Exchange {
  constructor(options) {
    this.options = options;
    this.connection = new Promise(resolve => resolve(false));
    this.channel = new Promise(resolve => resolve(false));
    this.name = this.options.exchange;
  }

  async setup() {
    // Connect
    const uri = amqpUri(this.options);
    this.connection = await amqp.connect(uri);
    this.channel = await this.connection.createChannel();

    // Assert exchange
    const response = await this.channel.assertExchange(this.name, 'topic');

    // Rabbit echoes exchange name on successful response.
    if (!response.exchange) {
      return false;
    }
    return response.exchange === this.options.exchange;
  }

  async assertQueue(queue) {
    const assertResponse = await this.channel.assertQueue(queue.name);

    // Rabbit echoes queue name on successful result.
    if (!assertResponse.queue) {
      return false;
    }

    if (assertResponse.queue !== queue.name) {
      throw new Error(`Failed to assert queue ${queue.name}`);
    }

    // TODO: bind queue to exchange.
    const bindPromises = queue.routes.map(async (route) => {
      await this.channel.bindQueue(queue.name, this.name, route);
      // Server returns nothing on bind operation,
      // so we just assume it worked
      return true;
    });

    // Resolves to true after all promises are fulfilled.
    await Promise.all(bindPromises);
    return true;
  }

}

module.exports = Exchange;
