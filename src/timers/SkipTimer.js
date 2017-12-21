'use strict';

// ------- Imports -------------------------------------------------------------

// const logger = require('winston');

// ------- Internal imports ----------------------------------------------------

// const RedisRetryDelayer = require('../lib/delayers/RedisRetryDelayer');
// const RetryManager = require('../lib/RetryManager');
const Timer = require('./Timer');

// ------- Class ---------------------------------------------------------------

/**
 * Skip timer: skips scheduled ticks until running tick isn't completed
 */
class SkipTimer extends Timer {
  constructor(blink) {
    super();

    // Expose app and its config.
    this.blink = blink;
    // Ensures tick has access to `this` object.
    this.tick = this.tick.bind(this);
    // Counts ticks.
    this.tickCounter = 0;
    // IntervalId.
    this.intervalId = false;
    // Execution lock.
    this.lock = false;
    // Default delay, 1000ms.
    this.delay = 1000;
  }

  start() {
    this.intervalId = setInterval(this.tick, this.delay);
  }

  stop() {
    clearInterval(this.intervalId);
  }

  async tick() {
    if (this.lock) {
      // Todo: log when to many ticks skipped?
      return false;
    }
    this.lock = true;
    this.tickCounter += 1;
    await this.run(this.tickCounter);
    this.lock = false;
    return true;
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = SkipTimer;

// ------- End -----------------------------------------------------------------
