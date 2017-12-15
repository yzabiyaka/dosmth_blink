'use strict';

const config = {
  host: process.env.BLINK_REDIS_HOST || 'localhost',
  port: process.env.BLINK_REDIS_PORT || '6379',
};

module.exports = config;
