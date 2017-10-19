'use strict';

const changeCase = require('change-case');

const Dequeuer = require('./Dequeuer');

class Queue {
  constructor(exchange) {
    this.exchange = exchange;
    this.channel = exchange.channel;

    // Transforms Queue class name:
    // - Removes conventional Q at the end
    // - Parametrizes string
    // For example, RemoteHttpRequestQ will become remote-http-request.
    this.name = changeCase.paramCase(this.constructor.name.replace(/Q$/, ''));

    // Define route keys.
    this.routes = [];
    // Automagically create direct route to the queue using its name.
    this.routes.push(this.name);
  }

  async setup() {
    return this.exchange.setupQueue(this);
  }

  /**
   * Send a single message to the queue bypassing routing.
   */
  publish(message) {
    return this.exchange.publish(this.name, message);
  }

  nack(message) {
    this.channel.reject(message, false);
  }

  ack(message) {
    this.channel.ack(message);
  }

  /**
   * Purge the queue.
   *
   * @return {Number} The number of messages purged from the queue
   */
  async purge() {
    let result;
    try {
      result = await this.channel.purgeQueue(this.name);
    } catch (error) {
      // Wrap HTTP exceptions in meaningful response.
      throw new Error(`Queue.purge(): failed to purge queue "${this.name}": ${error.message}`);
    }
    return result.messageCount;
  }

  subscribe(callback) {
    const dequeuer = new Dequeuer(this, callback);
    this.channel.consume(this.name, dequeuer.dequeue);
  }
}

module.exports = Queue;
