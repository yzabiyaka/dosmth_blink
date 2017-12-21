'use strict';

// ------- Imports -------------------------------------------------------------

// const logger = require('winston');

// ------- Internal imports ----------------------------------------------------

const RedisRetryDelayer = require('../lib/delayers/RedisRetryDelayer');
const SkipTimer = require('./SkipTimer');

// ------- Class ---------------------------------------------------------------

class RedisRetriesRepublishTimerTask extends SkipTimer {
  constructor(blink) {
    super(blink);

    // Bind process method to queue context
    this.run = this.run.bind(this);
  }

  setup() {
    // Repeat delay, ms.
    this.delay = 1000;
    // Convenience properties.
    this.redisRetryDelayer = new RedisRetryDelayer(
      this.blink.redis.getClient(),
      this.blink.redis.settings,
    );
  }

  async run() {
    // Get raw messages from redis.
    await this.redisRetryDelayer.getReadyMessages();
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = RedisRetriesRepublishTimerTask;

// ------- End -----------------------------------------------------------------
