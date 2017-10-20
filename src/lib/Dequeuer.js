'use strict';

const logger = require('winston');

const BlinkRetryError = require('../errors/BlinkRetryError');
const MessageParsingBlinkError = require('../errors/MessageParsingBlinkError');
const MessageValidationBlinkError = require('../errors/MessageValidationBlinkError');
const DelayLogic = require('./DelayLogic');

class Dequeuer {
  constructor(queue, callback, retryDelayLogic) {
    this.queue = queue;
    this.callback = callback;

    // Expose function by binding it to object context.
    this.dequeue = this.dequeue.bind(this);

    // Retry delay logic.
    if (!retryDelayLogic || typeof retryDelayLogic !== 'function') {
      // Default exponential backoff logic
      this.retryDelay = DelayLogic.exponentialBackoff;
    } else {
      this.retryDelay = retryDelayLogic;
    }

    // Retry limit is a hardcoded const now.
    this.retryLimit = 100;
  }

  async dequeue(rabbitMessage) {
    const message = this.extractOrDiscard(rabbitMessage);
    if (message) {
      await this.executeCallback(message);
    }
  }

  async executeCallback(message) {
    // Make sure nothing is thrown from here, it will kill the channel.
    let result;
    try {
      result = await this.callback(message);
    } catch (error) {
      // Got retry request.
      if (error instanceof BlinkRetryError) {
        this.retry(message, error);
        return false;
      }

      // Unexpected error, no retry requested.
      this.log(
        'warning',
        error.toString(),
        message,
        'message_processing_error',
      );
      // TODO: send to dead letters?
      this.queue.nack(message);
      return false;
    }

    // Acknowledge message and log result.
    this.queue.ack(message);
    if (result) {
      this.log(
        'debug',
        'Message acknowledged, processed true',
        message,
        'acknowledged_true_result',
      );
    } else {
      this.log(
        'debug',
        'Message acknowledged, processed false',
        message,
        'success_message_ack_false_result',
      );
    }
    return true;
  }

  extractOrDiscard(rabbitMessage) {
    const message = this.unpack(rabbitMessage);
    if (!message || !this.validate(message)) {
      return false;
    }
    return message;
  }

  unpack(rabbitMessage) {
    let message;

    // Transform raw to Message object.
    try {
      message = this.queue.messageClass.fromRabbitMessage(rabbitMessage);
    } catch (error) {
      if (error instanceof MessageParsingBlinkError) {
        this.log(
          'warning',
          `payload='${error.badPayload}' Can't parse payload: ${error}`,
          null,
          'error_cant_parse_message',
        );
      } else {
        this.log(
          'warning',
          `Unknown message parsing error: ${error}`,
          null,
          'error_cant_parse_message_unknown',
        );
      }
      this.queue.nack(rabbitMessage);
      return false;
    }
    return message;
  }

  validate(message) {
    // Validate payload.
    try {
      message.validate();
    } catch (error) {
      if (error instanceof MessageValidationBlinkError) {
        this.log(
          'warning',
          error.toString(),
          message,
          'error_queue_message_validation',
        );
      } else {
        this.log(
          'warning',
          `Unexpected message validation error: ${error}`,
          null,
          'error_queue_unexpected_message_validation',
        );
      }
      this.queue.nack(message);
      return false;
    }

    this.log(
      'debug',
      `Message valid ${message.toString()}`,
      message,
      'success_message_valid',
    );

    return true;
  }

  retry(message, error) {
    // Checked if retry limit reached.
    const retryNumber = message.getMeta().retry || 0;
    if (retryNumber > this.retryLimit) {
      // Retry limit reached
      this.queue.nack(message);
      this.log(
        'warning',
        `Got error ${error}, retry limit reached, rejecting`,
        message,
        'error_got_retry_limit_reached',
      );
      return false;
    }

    // Calculate wait time until the redelivery.
    const delayMilliseconds = this.retryDelay(retryNumber);

    // Log retry information.
    this.log(
      'warning',
      `Got error ${error}, retry ${retryNumber}, retrying after ${delayMilliseconds}ms`,
      message,
      'error_got_retry_request',
    );

    // Delay the redelivery.
    this.scheduleRedeliveryIn(delayMilliseconds, message, error.toString());
    return true;
  }

  scheduleRedeliveryIn(delayMilliseconds, message, reason) {
    setTimeout(() => this.redeliver(message, reason), delayMilliseconds);
  }

  redeliver(message, reason = 'unknown') {
    let retry = 0;
    if (message.getMeta().retry) {
      retry = message.getMeta().retry;
    }
    retry += 1;
    const retryMessage = message;
    retryMessage.payload.meta.retry = retry;
    retryMessage.payload.meta.retryReason = reason;
    // Republish modified message.
    this.queue.nack(message);
    this.queue.publish(retryMessage);
  }

  log(level, logMessage, message = {}, code = 'unexpected_code') {
    const meta = {
      // Todo: log env
      code,
      queue: this.queue.name,
      request_id: message ? message.getRequestId() : 'not_parsed',
    };

    logger.log(level, logMessage, meta);
  }
}

module.exports = Dequeuer;
