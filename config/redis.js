'use strict';

const DelayLogic = require('../src/lib/delayers/DelayLogic');

const config = {
  host: process.env.BLINK_REDIS_HOST || 'localhost',
  port: process.env.BLINK_REDIS_PORT || '6379',
  retryStrategy: DelayLogic.constantTimeDelay(1000),
};

module.exports = config;
