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
    let response = {};

    try {
      const uri = amqpUri(this.options);
      this.connection = await amqp.connect(uri);
    } catch (e1) {
      console.log('e1');
    }

    try {
      this.channel = await this.connection.createChannel();
      this.channel.on("error", (err) => {
        // throw "Lol";
      })
    } catch (e2) {
      console.log('e2');
    }

    try {
      this.response = await this.channel.assertExchange(this.name, 'topic');
    } catch (e3) {
      // console.log('e3');
      // console.dir(e3, { colors: true, showHidden: true });
      throw e3;
    }
    return this.response;

    // try {
    //   // Connect
    //   

    //   
    //   then(result => console.log('yess'))
    //   .catch(err => console.log('no'));

    // } catch (error) {
    //   // Wrap HTTP exceptions in meaningful response.
    //   // throw new Error(`Incorrect Exchange::setup() response for Exchange "${this.name}": ${error.message}`);
    //   console.log('fail');
    // }

    // // Rabbit echoes exchange name on successful response.
    // if (!response.exchange) {
    //   return false;
    // }
    // return response.exchange === this.options.exchange;
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
