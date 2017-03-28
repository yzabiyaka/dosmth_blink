'use strict';

/**
 * Imports.
 */
const config = require('../config');
const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');

/**
 * Initializations.
 */
// Chdir to project root to ensure that relative paths work.
process.chdir(__dirname);

// Web server
const app = new Koa();
const router = new Router();

// Save app config to express locals.
// app.locals = config;

// Setup express app based on local configuration.
app.env = config.app.env;

/**
 * Routing.
 */
// Root:
router.get('/', async (ctx) => {
  ctx.body = 'Hi, I\'m Blink!'
});

// // Api root:
// app.use('/api', require('./api'));

// // API Version 1
// app.use('/api/v1', require('./api/v1'));

app
  .use(router.routes())
  .use(router.allowedMethods());

/**
 * Create server.
 */
const server = http.createServer(app.callback());
server.listen(config.express.port, config.express.host, () => {
  const address = server.address();
  // Make sure random port setting gets overriden with actual resolved port.
  config.express.port = address.port;
  config.logger.info(
    `Blink is listening on http://${config.express.host}:${config.express.port} env:${config.app.env}`
  );
});

module.exports = app;
