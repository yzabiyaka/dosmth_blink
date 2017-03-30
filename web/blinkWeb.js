'use strict';

/**
 * Imports.
 */
const bodyParser = require('koa-bodyparser');
const config = require('../config');
const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const uuidV4 = require('uuid/v4');
const ApiController = require('./controllers/ApiController');
const ToolsController = require('./controllers/ToolsController');

/**
 * Initializations.
 */
// Chdir to project root to ensure that relative paths work.
process.chdir(__dirname);

// Web server
const blinkWeb = new Koa();

// Setup web middleware.
blinkWeb.use(bodyParser());

// Set context id.
blinkWeb.use(async (ctx, next) => {
  ctx.id = ctx.id || uuidV4();
  await next();
  ctx.set('X-Request-Id', ctx.id);
})

const router = new Router();
config.router = router;

// Setup web server env from local config.
blinkWeb.env = config.app.env;

/**
 * Initialize all controllers.
 */
const apiController = new ApiController(config);
const toolsController = new ToolsController(config);

/**
 * Routing.
 */
router.get('/', async (ctx) => {
  ctx.body = 'Hi, I\'m Blink!';
});
router.get('api.index', '/api', apiController.index);
router.get('api.v1', '/api/v1', apiController.v1);
router.get('api.v1.tools', '/api/v1/tools', toolsController.index);
router.post('api.v1.tools.fetch', '/api/v1/tools/fetch', toolsController.fetch);

blinkWeb
  .use(router.routes())
  .use(router.allowedMethods());

/**
 * Create server.
 */
const server = http.createServer(blinkWeb.callback());
server.listen(config.web.bind_port, config.web.bind_address, () => {
  const address = server.address();
  // Make sure random port setting gets overriden with actual resolved port.
  config.web.bind_port = address.port;
  config.logger.info(
    `Blink is listening on http://${config.web.hostname}:${config.web.bind_port} env:${config.app.env}`
  );
});

module.exports = blinkWeb;
