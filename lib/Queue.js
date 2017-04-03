'use strict';

const changeCase = require('change-case');

const MessageParsingError = require('../errors/MessageParsingError');

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
    this.consumeIncomingMessage = this.consumeIncomingMessage.bind(this);
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
    // TODO: generate consumer tag
    this.logger.info(`Listening for message in "${this.name}" queue`);
    this.exchange.channel.consume(this.name, this.consumeIncomingMessage);
  }

  consumeIncomingMessage(incomingMessage) {
    try {
      const message = this.processIncomingMessage(incomingMessage)
    } catch (error) {
      if (error instanceof MessageParsingError) {
        this.logger.error(`Queue ${this.name}: can't parse payload, reason: "${error}", payload: "${error.rawPayload}"`);
      } else {
        this.logger.error(`Queue ${this.name} uncaught exception ${error}`);
      }

      // TODO: send to dead letters?
      this.exchange.channel.reject(incomingMessage, false);
    }
  }


}

module.exports = Queue;
