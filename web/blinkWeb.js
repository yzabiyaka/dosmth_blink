'use strict';

/**
 * Imports.
 */
const express = require('express');
const http = require('http');
const config = require('../config');

/**
 * Initializations.
 */
// Chdir to project root to ensure that relative paths work.
process.chdir(__dirname);

// Express.
const app = express();

// Save app config to express locals.
app.locals = config;

// Setup express app based on local configuration.
app.set('env', config.app.env);

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
server.listen(config.express.port, config.express.host, () => {
  const address = server.address();
  // Make sure random port setting gets overriden with actual resolved port.
  config.express.port = address.port;
  config.logger.info(
    `Blink is listening on http://${config.express.host}:${config.express.port} env:${config.app.env}`
  );
});

module.exports = app;
