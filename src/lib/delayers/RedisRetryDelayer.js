'use strict';

// ------- Lint exceptions -----------------------------------------------------

// We want this method to inherit from the interface.
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["delayMessageRetry"] }] */

// ------- Imports -------------------------------------------------------------

const logger = require('winston');
const moment = require('moment');

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
    const redeliveryTime = RedisRetryDelayer.calculateRedeliveryTime(delayMs);
    // Save queue name to redeliver message to and convert message to String.
    const messageContent = RedisRetryDelayer.prepareMessage(message, queue);
    // Publish message to redis.
    let result;
    try {
      result = await this.ioredis.zadd(
        this.retrySetName,
        redeliveryTime,
        messageContent,
      );
    } catch (error) {
      logger.error(`Redis zadd error: ${error}.`, {
        code: 'error_redis_retry_delayer_zadd',
      });
    }

    if (result !== 1) {
      logger.debug(`Redis message already present: ${message}.`, {
        code: 'sucess_redis_retry_delayer_message_saved',
      });
    }

    logger.debug(`Redis message saved: ${message}.`, {
      code: 'sucess_redis_retry_delayer_message_saved',
    });

    // Acknowledge original message.
    queue.ack(message);

    return true;
  }

  static calculateRedeliveryTime(delayMs) {
    const currentMoment = moment();
    currentMoment.add(delayMs, 'milliseconds');
    return currentMoment.unix();
  }

  static prepareMessage(message, queue) {
    message.setRetryReturnToQueue(queue.name);
    return message.toString();
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = RedisRetryDelayer;

// ------- End -----------------------------------------------------------------
