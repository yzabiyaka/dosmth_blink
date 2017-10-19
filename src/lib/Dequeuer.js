'use strict';

const logger = require('winston');

const BlinkRetryError = require('../errors/BlinkRetryError');
const MessageParsingBlinkError = require('../errors/MessageParsingBlinkError');
const MessageValidationBlinkError = require('../errors/MessageValidationBlinkError');

class Dequeuer {
  constructor(queue, callback) {
    this.queue = queue;
    this.callback = callback;

    // Expose function by binding it to object context.
    this.dequeue = this.dequeue.bind(this);
  }

  retry(reason, message) {
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

  async dequeue(rabbitMessage) {
    await this.processMessage(rabbitMessage);
  }

  async processMessage(rabbitMessage) {
    // Make sure nothing is thrown from here, it will kill the channel.
    const message = this.unpack(rabbitMessage);
    if (!message || !this.validate(message)) {
      return false;
    }

    let result;
    try {
      result = await this.callback(message);
    } catch (error) {
      if (error instanceof BlinkRetryError) {
        // Todo: move to setting
        const retryLimit = 100;
        const retry = message.getMeta().retry || 0;
        const retryDelay = Dequeuer.retryDelay(retry);
        if (retry < retryLimit) {
          this.log(
            'warning',
            `Got error ${error}, retry ${retry}, retrying after ${retryDelay}ms`,
            message,
            'error_got_retry_request',
          );
          setTimeout(() => {
            this.retry(error.toString(), message);
          }, retryDelay);
        } else {
          this.log(
            'warning',
            `Got error ${error}, retry limit reached, rejecting`,
            message,
            'error_got_retry_limit_reached',
          );
          this.queue.nack(message);
        }
        return false;
      }

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

    // TODO: Ack here depending on rejection exception? on result?
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

  log(level, logMessage, message = {}, code = 'unexpected_code') {
    const meta = {
      // Todo: log env
      code,
      queue: this.queue.name,
      request_id: message ? message.getRequestId() : 'not_parsed',
    };

    logger.log(level, logMessage, meta);
  }

  static retryDelay(currentRetryNumber) {
    // Make longer delays as number of retries increases.
    // https://docs.google.com/spreadsheets/d/1AECd5YrOXJnYlH7BW9wtPBL2Tqp5Wjd3c0VnYGqA780/edit?usp=sharing
    // eslint-disable-next-line no-mixed-operators
    return ((currentRetryNumber ** 2) / 4 + 1) * 1000;
  }
}

module.exports = Dequeuer;
