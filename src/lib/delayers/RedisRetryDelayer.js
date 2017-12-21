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
  constructor(redisClient, { retrySet, retrySetProcessLimit }) {
    super();
    this.redisClient = redisClient;
    this.retrySet = retrySet;
    this.retrySetProcessLimit = retrySetProcessLimit;
  }

  /**
   * Sends `message` to Redis Sorted Set, ordered by the return time,
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
    const redeliveryTime = RedisRetryDelayer.calculateReturnTime(delayMs);
    // Save queue name to redeliver message to and convert message to String.
    const messageContent = RedisRetryDelayer.packMessage(message, queue);
    // Publish message to redis.
    let result;
    try {
      result = await this.redisClient.zadd(
        this.retrySet,
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

    // Free original message from the broker.
    queue.ack(message);

    return true;
  }

  async getReadyMessages() {
    const packedMessages = await this.redisClient.zrangebyscore(
      this.retrySet,
      0, // from 0
      moment().unix(), // to date
      ['LIMIT', 0, this.retrySetProcessLimit],
    );

    return packedMessages;
  }

  static calculateReturnTime(delayMs) {
    const currentMoment = moment();
    currentMoment.add(delayMs, 'milliseconds');
    return currentMoment.unix();
  }

  static packMessage(message, queue) {
    message.setRetryReturnToQueue(queue.name);
    return message.toString();
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = RedisRetryDelayer;

// ------- End -----------------------------------------------------------------
