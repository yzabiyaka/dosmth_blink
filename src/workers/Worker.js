'use strict';

const logger = require('winston');

class Worker {
  constructor(blink) {
    this.blink = blink;
  }

  perform() {
    if (this.queue) {
      logger.debug(`Listening for messages in "${this.queue.name}" queue`);
      // Limit the number of messages simultaneously loaded into
      // worker's memory to avoid reaching memory limit.
      this.limitMessagesInMemory(this.blink.config.app.prefetchCount);

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

      this.queue.subscribe(this.consume, rateLimit);
    } else {
      logger.warning('Queue is not established, waiting');
    }
  }

  limitMessagesInMemory(prefetchCount) {
    const meta = {
      env: this.blink.config.app.env,
      code: 'debug_prefetch_count_set',
      worker: this.constructor.name,
    };

    logger.debug(
      `Limiting messages in memory to ${prefetchCount}`,
      meta,
    );

    this.blink.exchange.limitConsumerPrefetchCount(prefetchCount);
  }
}

module.exports = Worker;
