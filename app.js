'use strict';

/**
 * Imports.
 */
const express = require('express');

/**
 * Initialize Express.
 */
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
 * Listen.
 */
app.listen(app.locals.express.port, () => {
  app.locals.logger.info(`Blink is listening on port:${app.locals.express.port} env:${app.get('env')}`);
});

module.exports = app;
