'use strict';

const winston = require('winston');

// Setup winston default instance
const LOGGER_LEVEL = process.env.LOGGER_LEVEL || 'info';
const LOGGER_TIMESTAMP = !(process.env.LOGGER_TIMESTAMP === 'false');
const LOGGER_COLORIZE = !(process.env.LOGGER_COLORIZE === 'false');
const LOGGER_PRETTY_PRINT = !(process.env.LOGGER_PRETTY_PRINT === 'false');

winston.configure({
  transports: [
    new winston.transports.Console({
      prettyPrint: LOGGER_PRETTY_PRINT,
      colorize: LOGGER_COLORIZE,
      level: LOGGER_LEVEL,
      timestamp: LOGGER_TIMESTAMP,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console({
      prettyPrint: LOGGER_PRETTY_PRINT,
      colorize: LOGGER_COLORIZE,
    }),
  ],
});
