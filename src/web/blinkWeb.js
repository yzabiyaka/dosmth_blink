'use strict';

/**
 * Imports.
 */
const http = require('http');
const Koa = require('koa');
const auth = require('koa-basic-auth');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const uuidV4 = require('uuid/v4');

const config = require('../../config');
const Initializer = require('../lib/Initializer');
const ApiWebController = require('./controllers/ApiWebController');
const ToolsWebController = require('./controllers/ToolsWebController');
const WebHooksWebController = require('./controllers/WebHooksWebController');

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
});

// Setup web server env from local config.
blinkWeb.env = config.app.env;

// Authentication
// Custom 401 handling
blinkWeb.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.set('WWW-Authenticate', 'Basic');
      // Doctor Who Easter Egg
      // Copyright info: http://tardis.wikia.com/wiki/File:Angel_bares_fangs.jpg
      ctx.set('Content-type', 'text/html');
      ctx.body = 'Don\'t blink!<br /><img src="https://vignette4.wikia.nocookie.net/tardis/images/1/1d/Angel_bares_fangs.jpg/revision/latest/scale-to-width-down/640?cb=20120607033826">';
    } else {
      throw err;
    }
  }
});
blinkWeb.use(auth({ name: config.app.auth.name, pass: config.app.auth.password }));

// Setup dependencies.
const router = new Router();
config.router = router;
config.initializer = new Initializer(config);

config.initializer.getExchange();
config.initializer.getFetchQ();
config.initializer.getCustomerIoWebhookQ();

/**
 * Initialize all web controllers.
 */
const apiWebController = new ApiWebController(config);
const toolsWebController = new ToolsWebController(config);
const webHooksWebController = new WebHooksWebController(config);

/**
 * Routing.
 */
router.get('/', async (ctx) => {
  ctx.body = 'Hi, I\'m Blink!';
});
router.get('api.index', '/api', apiWebController.index);
router.get('api.v1', '/api/v1', apiWebController.v1);
router.get('api.v1.tools', '/api/v1/tools', toolsWebController.index);
router.post('api.v1.tools.fetch', '/api/v1/tools/fetch', toolsWebController.fetch);
router.get('api.v1.webhooks', '/api/v1/webhooks', webHooksWebController.index);
router.post('api.v1.webhooks.customerio', '/api/v1/webhooks/customerio', webHooksWebController.customerio);

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
