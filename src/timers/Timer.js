'use strict';

// ------- Imports -------------------------------------------------------------

// const Redis = require('ioredis');
// const logger = require('winston');

// ------- Internal imports ----------------------------------------------------

// const RedisRetryDelayer = require('../lib/delayers/RedisRetryDelayer');
// const RetryManager = require('../lib/RetryManager');

// ------- Class ---------------------------------------------------------------

class Timer {
  constructor(blink) {
    this.blink = blink;
    this.tick = this.tick.bind(this);
    this.counter = 0;
    this.concurrent = 0;
  }

  start() {
    setInterval(this.tick, this.interval);
  }

  async tick() {
    // Todo: implement pause when to many concurrent?
    this.counter += 1;
    this.concurrent += 1;
    await this.run(this.counter);
    this.concurrent -= 1;
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = Timer;

// ------- End -----------------------------------------------------------------
