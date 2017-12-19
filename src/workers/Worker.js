'use strict';

// ------- Imports -------------------------------------------------------------

const Redis = require('ioredis');
const uuidV4 = require('uuid/v4');
const logger = require('winston');

// ------- Internal imports ----------------------------------------------------

const RedisRetryDelayer = require('../lib/delayers/RedisRetryDelayer');
const RetryManager = require('../lib/RetryManager');

// ------- Class ---------------------------------------------------------------

class Worker {
  constructor(blink) {
    this.blink = blink;
  }

  async start() {
    if (!this.queue) {
      logger.warning('Queue is not established, waiting');
      return;
    }

    // Limit the number of messages simultaneously loaded into
    // worker's memory to avoid reaching memory limit.
    await this.limitMessagesInMemory(this.blink.config.app.prefetchCount);

    // @todo: make rate limit configurable per worker
    const rateLimit = this.blink.config.app.rateLimit;
    const workerName = this.constructor.name;
    // TODO: get from dyno?
    const consumerName = `${workerName}-${uuidV4()}`;

    const meta = {
      env: this.blink.config.app.env,
      code: 'debug_rate_limit_set',
      worker: workerName,
    };

    logger.debug(
      `Rate limit set to ${rateLimit}`,
      meta,
    );

    // Initialize ioredis for the delay infrastructure.
    const ioredis = new Redis(this.blink.config.redis);
    const redisRetryDelayer = new RedisRetryDelayer(ioredis);

    // @todo: make retry manager configurable.
    const retryManager = new RetryManager(this.queue, false, redisRetryDelayer);

    // Semi-generated name
    const consumerTag = await this.queue.subscribe(
      this.consume,
      { rateLimit, retryManager },
      consumerName,
    );
    // returned consumerTag should be the same as consumerName
    logger.info(`Listening for messages in "${this.queue.name}" queue as ${consumerTag}`, {
      code: 'success_worker_start',
    });
  }

  async limitMessagesInMemory(prefetchCount) {
    const meta = {
      env: this.blink.config.app.env,
      code: 'debug_prefetch_count_set',
      worker: this.constructor.name,
    };

    logger.debug(
      `Limiting messages in memory to ${prefetchCount}`,
      meta,
    );

    // WARNING: only compatible with RabbitMQ.
    // TODO: Make sure this is abstracted out.
    // Workers shouldn't know internal specifics of brokers.
    // Might make sense to set it before App.start().
    return this.blink.broker.getChannel().prefetch(prefetchCount);
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = Worker;

// ------- End -----------------------------------------------------------------
