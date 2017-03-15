'use strict';

/**
 * Imports.
 */
const express = require('express');

/**
 * Initialize Express.
 */
const app = express();
// Configure app though locals.
app.locals = require('./config');

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
