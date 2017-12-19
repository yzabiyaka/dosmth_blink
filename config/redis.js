'use strict';

const config = {
  connection: {
    host: process.env.BLINK_REDIS_HOST || 'localhost',
    port: process.env.BLINK_REDIS_PORT || '6379',
  },
  settings: {
    retrySet: process.env.BLINK_REDIS_RETRY_SET || 'blink_retries',
  },
};

module.exports = config;
