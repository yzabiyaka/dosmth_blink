'use strict';

const changeCase = require('change-case');

const Dequeuer = require('./Dequeuer');
const RetryManager = require('./RetryManager');

class Queue {
  constructor(broker, name = false) {
    this.broker = broker;

    if (!name) {
      // If name is not explicitly set, generate Queue name from class name:
      // - Removes conventional Q at the end
      // - Parametrizes string
      // For example, RemoteHttpRequestQ will become remote-http-request.
      this.name = changeCase.paramCase(this.constructor.name.replace(/Q$/, ''));
    } else {
      this.name = name;
    }

    // Define route keys.
    this.routes = [];
    // Automagically create direct route to the queue using its name.
    this.routes.push(this.name);
  }

  async assert() {
    this.broker.createQueue(this);
  }

  /**
   * Send a single message to the queue bypassing routing.
   */
  publish(message) {
    // return this.exchange.publish(this.name, message);
  }

  nack(message) {
    this.broker.reject(message, false);
  }

  ack(message) {
    this.broker.ack(message);
  }

  /**
   * Purge the queue.
   *
   * @return {Number} The number of messages purged from the queue
   */
  async purge() {
    let result;
    try {
      result = await this.broker.purgeQueue(this.name);
    } catch (error) {
      // Wrap HTTP exceptions in meaningful response.
      throw new Error(`Queue.purge(): failed to purge queue "${this.name}": ${error.message}`);
    }
    return result.messageCount;
  }

  /**
   * Deletes the queue.
   *
   * @return {Number} The number of messages deleted or dead-lettered along with the queue
   */
  async delete(ifUnused = false, ifEmpty = false) {
    let result;
    try {
      result = await this.broker.deleteQueue(this.name, {
        ifUnused,
        ifEmpty,
      });
    } catch (error) {
      // TODO: handle broker closing on unsuccessful delete?
      throw new Error(`Queue.delete(): failed to delete queue "${this.name}": ${error.message}`);
    }
    return result.messageCount;
  }

  subscribe(callback, options) {
    let { rateLimit, retryManager } = options;

    if (!retryManager) {
      retryManager = new RetryManager(this);
    }
    if (!rateLimit) {
      rateLimit = 100;
    }

    const dequeuer = new Dequeuer(this, callback, retryManager, rateLimit);
    this.dequeuer = dequeuer;
    this.broker.consume(this.name, dequeuer.dequeue);
  }
}

module.exports = Queue;
