'use strict';

/**
 * Imports.
 */
const config = require('../config');
const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const ApiController = require('./controllers/ApiController');

/**
 * Initializations.
 */
// Chdir to project root to ensure that relative paths work.
process.chdir(__dirname);

// Web server
const blinkWeb = new Koa();
const router = new Router();
config.router = router;

// Setup web server env from local config.
blinkWeb.env = config.app.env;

/**
 * Initialize all controllers.
 */
const apiController = new ApiController(config);

/**
 * Routing.
 */
router.get('/', async (ctx) => {
  ctx.body = 'Hi, I\'m Blink!';
});
router.get('apiRoot', '/api', apiController.bindTo('index'));
router.get('v1', '/api/v1', apiController.bindTo('v1'));

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
