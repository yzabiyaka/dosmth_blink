'use strict';

const logger = require('winston');

const DelayLogic = require('../lib/DelayLogic');
const RetryManager = require('../lib/RetryManager');

class Worker {
  constructor(blink) {
    this.blink = blink;
  }

  async start() {
    if (this.queue) {
      // Limit the number of messages simultaneously loaded into
      // worker's memory to avoid reaching memory limit.
      await this.limitMessagesInMemory(this.blink.config.app.prefetchCount);

      // @todo: make rate limit configurable per worker
      const rateLimit = this.blink.config.app.rateLimit;

      const meta = {
        env: this.blink.config.app.env,
        code: 'debug_rate_limit_set',
        worker: this.constructor.name,
      };

      logger.debug(
        `Rate limit set to ${rateLimit}`,
        meta,
      );

      // @todo: make retry manager configurable.
      const retryManager = new RetryManager(this.queue, DelayLogic.constantTimeDelay(1000));
      // Hardcoding rate limit to be 18,000 (approx 5 hours)
      // @todo: remove
      retryManager.retryLimit = this.blink.config.app.retryLimit;

      const tag = await this.queue.subscribe(this.consume, { rateLimit, retryManager });
      logger.info(`Listening for messages in "${this.queue.name}" queue as ${tag}`, {
        code: 'success_worker_start'
      });
    } else {
      logger.warning('Queue is not established, waiting');
    }
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

module.exports = Worker;
