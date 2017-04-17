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
      formatter: (options) => {
        const message = [];
        if (LOGGER_TIMESTAMP) {
          message.push(new Date().toISOString());
        }
        // TODO: log dyno name
        message.push('app[]:');
        message.push(`at=${options.level}`);
        // TODO: get from config
        message.push('application=blink');
        if (options.meta.length > 0) {
          options.meta.forEach((key, value) => {
            message.push(`${key}=${value}`);
          });
        }
        if (options.message) {
          message.push(options.message);
        }
        return message.join(' ');
      },
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console({
      prettyPrint: LOGGER_PRETTY_PRINT,
      colorize: LOGGER_COLORIZE,
    }),
  ],
});
