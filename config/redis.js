'use strict';

const config = {
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};

module.exports = config;
