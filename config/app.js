'use strict';

const config = {
  name: process.env.BLINK_APP_NAME || 'blink',
  env: process.env.NODE_ENV || 'development',
  auth: {
    name: process.env.BLINK_APP_AUTH_NAME || 'blink',
    password: process.env.BLINK_APP_AUTH_PASSWORD || 'blink',
  },
};

module.exports = config;
