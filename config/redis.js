'use strict';

const DelayLogic = require('../src/lib/delayers/DelayLogic');

const config = {
  connection: {
    host: process.env.BLINK_REDIS_HOST || 'localhost',
    port: process.env.BLINK_REDIS_PORT || '6379',
    retryStrategy: DelayLogic.constantTimeDelay(1000),
  },
  settings: {
    retrySetName: process.env.BLINK_REDIS_RETRY_SET_NAME || 'blink_retries',
  },
};

module.exports = config;
