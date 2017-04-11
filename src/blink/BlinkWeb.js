'use strict';

const changeCase = require('change-case');
const http = require('http');
const Koa = require('koa');
const auth = require('koa-basic-auth');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');

const basicAuthCustom401 = require('../web/middleware/basicAuthCustom401');
const generateRequestId = require('../web/middleware/generateRequestId');
const Blink = require('./Blink');
const ApiWebController = require('../web/controllers/ApiWebController');
const ToolsWebController = require('../web/controllers/ToolsWebController');
const WebHooksWebController = require('../web/controllers/WebHooksWebController');

class BlinkWeb extends Blink {
  constructor(config) {
    super(config);
    this.web = {};

    // Dynamically create and assign controllers.
    this.web.controllers = this.initControllers([
      ApiWebController,
      ToolsWebController,
      WebHooksWebController,
    ]);

    // Define routing.
    this.router = this.initRouter();

    // Configure web sever.
    this.web.server = this.initWebServer();
  }

  initRouter() {
    // Define controller shortcuts for convenience.
    const {
      apiWebController,
      toolsWebController,
      webHooksWebController,
    } = this.web.controllers;

    const router = new Router();
    router.get('root', '/', apiWebController.welcome);
    router.get('api.v1', '/api/v1', apiWebController.v1);
    router.get('api.index', '/api', apiWebController.index);
    router.get('api.v1', '/api/v1', apiWebController.v1);
    router.get('api.v1.tools', '/api/v1/tools', toolsWebController.index);
    router.post('api.v1.tools.fetch', '/api/v1/tools/fetch', toolsWebController.fetch);
    router.get('api.v1.webhooks', '/api/v1/webhooks', webHooksWebController.index);
    router.post('api.v1.webhooks.customerio', '/api/v1/webhooks/customerio', webHooksWebController.customerio);
    return router;
  }

  initControllers(controllerClasses) {
    const controllerMapping = {}
    controllerClasses.forEach((controllerClass, i) => {
      // Construct new controller.
      const controller = new controllerClasses[i](this.config);
      // Use camelcased controller name as a map key.
      const mappingKey = changeCase.camelCase(controllerClass.name);
      // Return an item of 2D array for further map transformation.
      controllerMapping[mappingKey] = controller;

    });
    return controllerMapping;
  }

  initWebServer() {
    const server = new Koa();

    // Setup web server env from local config.
    // https://github.com/koajs/koa/blob/master/docs/api/index.md#settings
    server.env = this.config.app.env;

    // -------- Setup web middleware --------
    // Parse incoming request bodies in a middleware before your handlers,
    // available under the req.body property.
    server.use(bodyParser());

    // Generate unique request id.
    server.use(generateRequestId);

    // Basic Authentication:
    // Custom 401 handling.
    // https://github.com/koajs/basic-auth#example
    server.use(basicAuthCustom401);
    // Enable auth.
    server.use(auth({
      name: this.config.app.auth.name,
      pass: this.config.app.auth.password,
    }));

    // Inject Koa Router routes and allowed methods.
    server.use(this.router.routes());
    server.use(this.router.allowedMethods());
    return server;
  }

  async bootstrap() {
    await super.bootstrap();

    const server = http.createServer(this.web.server.callback());
    server.listen(this.config.web.bind_port, this.config.web.bind_address, () => {
      const address = server.address();
      // Make sure random port setting gets overriden with actual resolved port.
      this.config.web.bind_port = address.port;
      this.config.logger.info(
        `Blink is listening on http://${this.config.web.hostname}:${this.config.web.port} env:${this.config.app.env}`
      );
    });
  }
}

module.exports = BlinkWeb;
