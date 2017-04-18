'use strict';

const amqpUri = require('amqp-uri');
const amqp = require('amqplib');
const logger = require('winston');

class Exchange {
  constructor(config) {
    this.config = config;
    this.connection = new Promise(resolve => resolve(false));
    this.channel = new Promise(resolve => resolve(false));
    this.name = this.config.amqp.exchange;
  }

  async setup() {
    // Assert exchange

    const uri = amqpUri(this.config.amqp);
    this.connection = await amqp.connect(uri, {
      clientProperties: {
        app: {
          // TODO: add dyno name
          name: this.config.app.name,
          version: this.config.app.version,
          env: this.config.app.env,
        }
      }
    });

    this.channel = await this.connection.createChannel();
    // this.channel.on('error', errorHandler);
    // this.channel.on('error', closeHandler);
    // // See http://www.squaremobius.net/amqp.node/channel_api.html#channel-events
    // // TODO: Handle return events
    // // TODO: Handle drain events
    // this.channel.on('close', () => {
    //   console.dir(this.channel, { colors: true, showHidden: true });
    //   // const meta = {

    //   // }
    //   // logger.error('Channel closed', meta);
    // });

    let response = {};
    try {
      response = await this.channel.assertExchange(this.name, 'topic');
    } catch (error) {
      // Wrap HTTP exceptions in meaningful response.
      throw new Error(`Exchange.setup(): Exchange assertion failed for "${this.name}": ${error.message}`);
    }

    // Rabbit echoes exchange name on successful response.
    return response.exchange === this.name;
  }

  async setupQueue(queue) {
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

  publish(routingKey, message) {
    const options = {
      // The message will be returned if it is not routed to a queue.
      mandatory: true,
      // Always persistent.
      persistent: true,
    };

    // Todo: save additional message metadata

    // TODO: handle drain and returned messages.
    // See http://www.squaremobius.net/amqp.node/channel_api.html#channel-events
    // eslint-disable-next-line no-unused-vars
    const result = this.channel.publish(
      this.name,
      routingKey,
      new Buffer(message.toString(), 'utf-8'),
      options
    );

    // Always true.
    return true;
  }

}

module.exports = Exchange;
