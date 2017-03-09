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
const LOGGING_LEVEL = process.env.LOGGING_LEVEL || 'info';


/**
 * Dependencies initializations.
 */
const app = express();

// Logger:
app.locals.logger = new winston.Logger({
  transports: [
    new winston.transports.Console({ prettyPrint: true, colorize: true, level: LOGGING_LEVEL }),
  ],
  exceptionHandlers: [
    new winston.transports.Console({ prettyPrint: true, colorize: true }),
  ],
});
// Just a shortcut.
const logger = app.locals.logger;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(LISTEN_PORT, () => {
  logger.info(`Blink is listening on port:${LISTEN_PORT} env:${app.get('env')}`);
});

module.exports = app;
