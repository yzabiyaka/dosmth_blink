'use strict';

const changeCase = require('change-case');

class Queue {
  constructor(exchange) {
    this.exchange = exchange;

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
    const result = await this.exchange.assertQueue(this);
    return result;
  }

  /**
   * Send a single message to the queue bypassing routing.
   */
  async publish(payload) {
    let result;
    const message = this.prepareMessage(payload);
    try {
      result = await this.exchange.channel.sendToQueue(this.name, message);
    } catch (error) {
      // Wrap HTTP exceptions in meaningful response.
      throw new Error(`Queue.publish(): failed to publish a message to queue ${this.name}: ${error.message}`);
    }
    return result;
  }

  /**
   * Purge the queue.
   *
   * @return {Number} The number of messages purged from the queue
   */
  async purge(payload) {
    let result;
    try {
      result = await this.exchange.channel.purgeQueue(this.name);
    } catch (error) {
      // Wrap HTTP exceptions in meaningful response.
      throw new Error(`Queue.Purge(): failed to Purge queue ${this.name}: ${error.message}`);
    }
    return result.messageCount;
  }

  prepareMessage(payload) {
    // Todo: extend payload with metadata.
    const msgBuffer = new Buffer(JSON.stringify(payload), 'utf-8');
    return msgBuffer;
  }
}

module.exports = Queue;
