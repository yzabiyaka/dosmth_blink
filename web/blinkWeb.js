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
const blinkWeb = new Koa();
const router = new Router();

// Save app config to web server globals.
// TODO: find a good way to inject configuration into objects.
// app.locals = config;

// Setup web server env from local config.
blinkWeb.env = config.app.env;

/**
 * Routing.
 */
const apiRouter = require('./api');
const apiV1Router = require('./api/v1');

// Root:
router.get('/', async (ctx) => {
  ctx.body = 'Hi, I\'m Blink!';
});
router.use('/api', apiRouter.routes(), apiRouter.allowedMethods());
router.use('/api/v1', apiV1Router.routes(), apiV1Router.allowedMethods());

blinkWeb
  .use(router.routes())
  .use(router.allowedMethods());

/**
 * Create server.
 */
const server = http.createServer(blinkWeb.callback());
server.listen(config.web.port, config.web.bind_address, () => {
  const address = server.address();
  // Make sure random port setting gets overriden with actual resolved port.
  config.web.port = address.port;
  config.logger.info(
    `Blink is listening on http://${config.web.hostname}:${config.web.port} env:${config.app.env}`
  );
});

module.exports = blinkWeb;
