'use strict';

const logger = require('winston');

const DelayLogic = require('./DelayLogic');

class RetryManager {
  constructor(queue, retryDelayLogic = false) {
    this.queue = queue;

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

module.exports = RetryManager;
