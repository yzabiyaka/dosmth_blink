'use strict';

// ------- Imports -------------------------------------------------------------

const logger = require('winston');

// ------- Internal imports ----------------------------------------------------

const MessageParsingBlinkError = require('../errors/MessageParsingBlinkError');
const MessageValidationBlinkError = require('../errors/MessageValidationBlinkError');
const RedisRetryDelayer = require('../lib/delayers/RedisRetryDelayer');
const Message = require('../messages/Message');
const SkipTimer = require('./SkipTimer');

// ------- Class ---------------------------------------------------------------

class RedisRetriesRepublishTimerTask extends SkipTimer {
  setup() {
    // Repeat delay, ms.
    super.setup(1000);
    // Convenience properties.
    this.redisRetryDelayer = new RedisRetryDelayer(
      this.blink.redis.getClient(),
      this.blink.redis.settings,
    );
  }

  async run() {
    // Get raw json messages from redis.
    const jsonMessages = await this.redisRetryDelayer.getReadyMessages();

    // Pressess each message.
    jsonMessages.forEach((jsonMessage) => {
      const payload = this.extractOrDiscardPayload(jsonMessage);
      if (!payload) {
        return;
      }

      // Get the name of the return queue.
      const queue = this.getReturnQueue(payload);
      if (!queue) {
        return;
      }

      // Build concrete message class and ensure it's valid.
      const message = this.buildValidMessage(payload, queue);
      if (!message) {
        return;
      }

      // Reset Message return queue property.
      message.deleteRetryReturnToQueue();

      // Republish the message to the top of the queue.
      queue.publish(message, 'HIGH');
      this.log(
        'debug',
        `Message sucesfully returned to queue ${queue.name}, ${message.toString()}`,
        message,
        'success_redis_republisher_message_republished',
      );
    });
  }

  extractOrDiscardPayload(jsonMessage) {
    let payload;
    try {
      // TODO: store message type in message itself.
      payload = Message.unpackJson(jsonMessage);
      if (!payload.data || !payload.meta) {
        throw new MessageParsingBlinkError('No data in message', payload);
      }
    } catch (error) {
      if (error instanceof MessageParsingBlinkError) {
        this.log(
          'warning',
          `payload='${error.badPayload}' Can't parse payload: ${error}`,
          null,
          'warning_redis_republisher_cant_parse_message',
        );
      } else {
        this.log(
          'warning',
          `Unexpected message parsing error: ${error}`,
          null,
          'warning_redis_republisher_cant_parse_message_unexpected',
        );
      }
      return false;
    }
    return payload;
  }

  getReturnQueue(payload) {
    const queueName = payload.meta.retryReturnToQueue;
    const queue = this.blink.getQueueByName(queueName);
    if (!queue) {
      this.log(
        'warning',
        `payload='${JSON.stringify(payload)}', Unknown queue: ${queueName}`,
        null,
        'warning_redis_republisher_unknown_queue',
      );
      return false;
    }
    return queue;
  }

  buildValidMessage(payload, queue) {
    const message = queue.messageClass.heuristicMessageFactory(payload);
    // Validate payload.
    try {
      message.validate();
    } catch (error) {
      if (error instanceof MessageValidationBlinkError) {
        this.log(
          'warning',
          error.toString(),
          message,
          'warning_redis_republisher_message_validation',
        );
      } else {
        this.log(
          'warning',
          `Unexpected message validation error: ${error}`,
          null,
          'warning_redis_republisher_message_validation_unexpected',
        );
      }
      return false;
    }

    this.log(
      'debug',
      `Message valid ${message.toString()}`,
      message,
      'success_redis_republisher_message_valid',
    );
    return true;
  }

  log(level, logMessage, message = {}, code = 'unexpected_code') {
    const meta = {
      code,
      timer: this.constructor.name,
      request_id: message ? message.getRequestId() : 'not_parsed',
    };

    logger.log(level, logMessage, meta);
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = RedisRetriesRepublishTimerTask;

// ------- End -----------------------------------------------------------------
