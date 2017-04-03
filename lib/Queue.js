'use strict';

const changeCase = require('change-case');

class Queue {
  constructor(exchange, logger = false) {
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

    // TODO: think of better method of exposing Logger.
    if (logger) {
      this.logger = logger;
    }

    // Bind process method to queue context
    this.process = this.process.bind(this);
  }

  async setup() {
    return this.exchange.assertQueue(this);
  }

  /**
   * Send a single message to the queue bypassing routing.
   */
  publish(payload) {
    return this.exchange.publishDirect(this, payload);
  }

  /**
   * Purge the queue.
   *
   * @return {Number} The number of messages purged from the queue
   */
  async purge() {
    let result;
    try {
      result = await this.exchange.channel.purgeQueue(this.name);
    } catch (error) {
      // Wrap HTTP exceptions in meaningful response.
      throw new Error(`Queue.purge(): failed to purge queue "${this.name}": ${error.message}`);
    }
    return result.messageCount;
  }

  startConsuming() {
    this.exchange.channel.consume(this.name, this.process);
  }

  process(msg) {
    const rawPayload = msg.content.toString();
    let payload = false;

    try {
      payload = JSON.parse(rawPayload);
    } catch (error) {
      this.logger.error(`Queue.process(): can't parse payload, queue: "${this.name}", reason: "${error}", payload: "${rawPayload}"`);
      this.exchange.channel.reject(msg, false);
      // TODO: send to dead letters?
      return;
    }

    console.dir(payload, { colors: true, showHidden: true });
  }

}

module.exports = Queue;
