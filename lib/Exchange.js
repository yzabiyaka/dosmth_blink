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
    // Assert exchange

    const uri = amqpUri(this.options);
    this.connection = await amqp.connect(uri);
    this.channel = await this.connection.createChannel();
    this.channel.on('error', () => {
      // Suppressing Exception thrown is channel callback,
      // so it's possible to actually catch this exception using Promises.
      // Without this rabbit connection would kill the app,
      // as it throws exeption from its own context.
      // Todo: log?
    });

    let response = {};
    try {
      response = await this.channel.assertExchange(this.name, 'topic');
    } catch (error) {
      // Wrap HTTP exceptions in meaningful response.
      throw new Error(`Exchange.setup(): Exchange assertion failed for "${this.name}": ${error.message}`);
    }

    // Rabbit echoes exchange name on successful response.
    return response.exchange === this.options.exchange;
  }

  async assertQueue(queue) {
    const assertResponse = await this.channel.assertQueue(queue.name);

    // Rabbit echoes queue name on successful result.
    if (assertResponse.queue !== queue.name) {
      throw new Error(`Exchange.setup(): Queue assertion failed for "${queue.name}"`);
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
