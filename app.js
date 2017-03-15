'use strict';

/**
 * Imports.
 */
const express = require('express');
const http = require('http');

/**
 * Initializations.
 */
// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname);

// Express.
const app = express();

// Setup locals variable in config/index.js.
app.locals = require('./config');

// Configure express app based on local configuration.
app.set('env', app.locals.express.env);

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
 * Create server.
 */
const server = http.createServer(app);
server.listen(app.locals.express.port, () => {
  const address = server.address();
  app.locals.logger.info(`Blink is listening on port:${address.port} env:${app.locals.express.env}`);
});

module.exports = app;
