'use strict';

const logger = require('winston');

const DelayLogic = require('./DelayLogic');

class RetryManager {
  constructor(queue, retryDelayLogic = false) {
    this.queue = queue;

    // Retry delay logic.
    if (!retryDelayLogic || typeof retryDelayLogic !== 'function') {
      // Default exponential backoff logic
      this.retryAttemptToDelayTime = DelayLogic.exponentialBackoff;
    } else {
      this.retryAttemptToDelayTime = retryDelayLogic;
    }

    // Retry limit is a hardcoded const now.
    this.retryLimit = 100;
  }

  async retry(message, error) {
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
    const delayMs = this.retryAttemptToDelayTime(retryAttempt);

    // Log retry information.
    this.log(
      'debug',
      `Retry scheduled, attempt ${retryAttempt}, reason '${error}'. Will run in ${delayMs}ms`,
      message,
      'debug_retry_manager_redeliver_scheduled',
    );

    return this.republishWithDelay(message, delayMs, error.toString());
  }

  async republishWithDelay(message, delayMs, reason = 'unknown') {
    // Calculate new retry attempt.
    let retryAttempt = 0;
    if (message.getMeta().retryAttempt) {
      retryAttempt = message.getMeta().retryAttempt;
    }
    retryAttempt += 1;

    // Update retry attempt.
    // TODO: check why it works. We're not copying message here, right?
    const retryMessage = message;
    retryMessage.payload.meta.retryAttempt = retryAttempt;
    retryMessage.payload.meta.retryReason = reason;

    // Delay republish using timeout.
    // Note: this conflicts with prefetch_count functionality, see issue #70.
    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Discard original message.
    this.queue.nack(message);
    // Republish modified message.
    this.queue.publish(retryMessage);
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
}

module.exports = RetryManager;
