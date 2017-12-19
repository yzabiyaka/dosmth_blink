'use strict';

// ------- Imports -------------------------------------------------------------

// const Redis = require('ioredis');
const logger = require('winston');

// ------- Internal imports ----------------------------------------------------

// const RedisRetryDelayer = require('../lib/delayers/RedisRetryDelayer');
// const RetryManager = require('../lib/RetryManager');

// ------- Class ---------------------------------------------------------------

class Timer {
  constructor(blink) {
    this.blink = blink;
  }

  setup() {
    logger.info('Timer setup', { test: this });
  }

  async start() {
    logger.info('Timer start', { test: this });
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = Timer;

// ------- End -----------------------------------------------------------------
