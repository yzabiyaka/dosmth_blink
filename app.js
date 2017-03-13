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
// const apiV1Router = express.Router();

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
 * Routing.
 */
// Root:
app.get('/', (req, res) => {
  res.send('Hi, I\'m Blink!');
});

// Api root:
app.use('/api', require('./api'));

// API Version 1
app.use('/api/v1', require('./api/v1'));


/**
 * Listen.
 */
app.listen(LISTEN_PORT, () => {
  logger.info(`Blink is listening on port:${LISTEN_PORT} env:${app.get('env')}`);
});

module.exports = app;
