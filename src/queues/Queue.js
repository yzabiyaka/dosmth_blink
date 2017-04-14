'use strict';

const changeCase = require('change-case');

const MessageParsingBlinkError = require('../errors/MessageParsingBlinkError');
const MessageValidationBlinkError = require('../errors/MessageValidationBlinkError');

class Queue {
  constructor(exchange, logger = false) {
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

    // TODO: think of better method of exposing Logger.
    if (logger) {
      this.logger = logger;
    }
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
    this.channel.consume(this.name, (rabbitMessage) => {
      // Make sure nothing is thrown from here, it will kill the channel.
      const message = this.processRawMessage(rabbitMessage);
      if (!message) {
        return false;
      }
      try {
        callback(message);
      } catch (error) {
        // TODO: better logging
        this.logger.error(`Queue ${this.name}: Message not processed ${message.payload.meta.id} | uncaught message processing exception ${error}`);
        // TODO: send to dead letters?
        this.nack(message);
        return false;
      }

      // TODO: Ack here depending on rejection exception?
      this.logger.info(`Message processed | ${message.payload.meta.id}`);
      return true;
    });
  }

  processRawMessage(rabbitMessage) {
    let message;

    // Transform raw to Message object.
    try {
      message = this.messageClass.fromRabbitMessage(rabbitMessage);
    } catch (error) {
      if (error instanceof MessageParsingBlinkError) {
        this.logger.error(`Queue ${this.name}: can't parse payload, reason: "${error}", payload: "${error.rawPayload}"`);
      } else {
        this.logger.error(`Queue ${this.name} unknown message parsing error ${error}`);
      }
      this.nack(rabbitMessage);
      return false;
    }

    // Validate payload.
    try {
      message.validate();
    } catch (error) {
      if (error instanceof MessageValidationBlinkError) {
        this.logger.error(`Queue ${this.name}: message validation error: "${error}", payload: "${error.payload}"`);
      } else {
        this.logger.error(`Queue ${this.name} unknown message validation error ${error}`);
      }
      this.nack(message);
      return false;
    }

    this.logger.info(`Message valid | ${message.payload.meta.id}`);
    return message;
  }

}

module.exports = Queue;
