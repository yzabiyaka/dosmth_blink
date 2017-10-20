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
    // Check if retry limit reached.
    const retryAttempt = message.getMeta().retryAttempt || 0;
    if (retryAttempt > this.retryLimit) {
      // Retry limit reached
      this.queue.nack(message);
      this.log(
        'debug',
        `Retry limit reached, rejecting. Retry reason '${error}'`,
        message,
        'debug_retry_manager_limit_reached',
      );
      return false;
    }

    // Calculate wait time until the redelivery.
    const delayMilliseconds = this.retryDelay(retryAttempt);

    // Log retry information.
    this.log(
      'debug',
      `Retry scheduled, attempt ${retryAttempt}, reason '${error}'. Will run in ${delayMilliseconds}ms`,
      message,
      'debug_retry_manager_redeliver_scheduled',
    );

    // Delay the redelivery.
    this.scheduleRedeliveryIn(delayMilliseconds, message, error.toString());
    return true;
  }

  scheduleRedeliveryIn(delayMilliseconds, message, reason) {
    setTimeout(() => this.redeliver(message, reason), delayMilliseconds);
  }

  redeliver(message, reason = 'unknown') {
    let retryAttempt = 0;
    if (message.getMeta().retryAttempt) {
      retryAttempt = message.getMeta().retryAttempt;
    }
    retryAttempt += 1;
    const retryMessage = message;
    retryMessage.payload.meta.retry = retryAttempt;
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
