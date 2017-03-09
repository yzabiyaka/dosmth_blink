'use strict';

/**
 * Imports.
 */
const express = require('express');
const winston = require('winston');

/**
 * Constants declarations.
 */
const LISTEN_PORT = process.env.LISTEN_PORT || 5050;
const LOGGER_LEVEL = process.env.LOGGER_LEVEL || 'info';
const LOGGER_TIMESTAMP = !(process.env.LOGGER_TIMESTAMP === 'false');

/**
 * Dependencies initializations.
 */
const app = express();
// const apiRouter = express.Router();

/**
 * Setting app locals.
 */
// Logger:
app.locals.logger = new winston.Logger({
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
const logger = app.locals.logger;

/**
 * Initialize routing.
 */
app.get('/', (req, res) => {
  res.send('Hi, I\'m Blink!');
});

/**
 * Listen.
 */
app.listen(LISTEN_PORT, () => {
  logger.info(`Blink is listening on port:${LISTEN_PORT} env:${app.get('env')}`);
});

module.exports = app;
