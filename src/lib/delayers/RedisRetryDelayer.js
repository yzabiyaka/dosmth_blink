'use strict';

// ------- Lint exceptions -----------------------------------------------------

// We want this method to inherit from the interface.
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["delayMessageRetry"] }] */

// ------- Internal imports ----------------------------------------------------

const RetryDelayer = require('./RetryDelayer');

// ------- Class ---------------------------------------------------------------

class RedisRetryDelayer extends RetryDelayer {
  constructor(ioredis, retrySetName) {
    super();
    this.ioredis = ioredis;
    this.retrySetName = retrySetName;
  }

  /**
   * Sends `message` to Redis Sorted Set, ordered by the expected retry time,
   * which is calculated from unix timestamp + `delayMs`.
   * When time has come, special Redis Retry Redelivery Worker
   * will republish it back to the `queue`.
   *
   * @see https://redis.io/topics/data-types#sorted-sets
   * @see https://redis.io/commands/zadd
   *
   * @param  {Queue}   queue          The queue to return the message to
   * @param  {Message} message        The message
   * @param  {integer} delayMs        The delay, milliseconds
   * @return {boolean}                The result of the operation
   */
  async delayMessageRetry(queue, message, delayMs) {
    // Calculate return (redelivery) time.
    // This will serve as the index for the ordered set.
    const redeliveryTime = this.calculateRedeliveryTime(delayMs);
    // Save queue name to redeliver message to and convert message to String.
    const messageContent = this.prepareMessage(message, queue);
    // Publish message to redis.
    const result = await this.ioredis.zadd(
      this.retrySetName,
      redeliveryTime,
      messageContent,
    );
    if (result !== 1) {
      // TODO: log failure.
      return false;
    }

    // TODO: log success.
    return true;
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = RedisRetryDelayer;

// ------- End -----------------------------------------------------------------
