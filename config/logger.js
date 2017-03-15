'use strict';

const winston = require('winston');

// Initialize winston.
const LOGGER_LEVEL = process.env.LOGGER_LEVEL || 'info';
const LOGGER_TIMESTAMP = !(process.env.LOGGER_TIMESTAMP === 'false');

module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console({
      prettyPrint: true,
      colorize: true,
      level: LOGGER_LEVEL,
      timestamp: LOGGER_TIMESTAMP,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console({ prettyPrint: true, colorize: true }),
  ],
});
