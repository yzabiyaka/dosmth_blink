'use strict';

// ------- Interface -----------------------------------------------------------

class RetryDelayer {
  async retryAfterDelay(queueName, messageContent, delayMs) {
    throw new TypeError('retryAfterDelay() method must be implemented when extending from RetryDelayer');
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = Delayer;

// ------- End -----------------------------------------------------------------
