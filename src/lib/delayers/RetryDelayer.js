'use strict';

// ------- Interface -----------------------------------------------------------

class RetryDelayer {
  /* eslint-disable no-unused-vars, class-methods-use-this */
  /* Next methods are interface methods declarations */

  /**
   * Schedules delay of `delayMs` milliseconds after which the message
   * with content `messageContent` will be redelivered to the queue `queueName`.
   *
   * @param  {string}  queueName      The name of the queue to return the message to
   * @param  {string}  messageContent The message content, serialized to a string
   * @param  {integer} delayMs        The delay, milliseconds
   * @return {boolean}                The result of the operation
   */
  async retryAfterDelay(queueName, messageContent, delayMs) {
    throw new TypeError('retryAfterDelay() method must be implemented when extending from RetryDelayer');
  }

  /* eslint-enable */
}

// ------- Exports -------------------------------------------------------------

module.exports = RetryDelayer;

// ------- End -----------------------------------------------------------------
