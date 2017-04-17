'use strict';

const changeCase = require('change-case');
const http = require('http');
const Koa = require('koa');
const auth = require('koa-basic-auth');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const logger = require('winston');

const basicAuthCustom401 = require('../web/middleware/basicAuthCustom401');
const generateRequestId = require('../web/middleware/generateRequestId');
const BlinkApp = require('./BlinkApp');
const ApiWebController = require('../web/controllers/ApiWebController');
const ToolsWebController = require('../web/controllers/ToolsWebController');
const WebHooksWebController = require('../web/controllers/WebHooksWebController');

class BlinkWebApp extends BlinkApp {
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
    this.web.router = this.initRouter();

    // Configure web sever.
    this.web.app = this.initWebApp();
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
    const controllerMapping = {};
    controllerClasses.forEach((controllerClass, i) => {
      // Construct new controller.
      const controller = new controllerClasses[i](this);
      // Use camelcased controller name as a map key.
      const mappingKey = changeCase.camelCase(controllerClass.name);
      // Add worker to mapping
      controllerMapping[mappingKey] = controller;
    });
    return controllerMapping;
  }

  initWebApp() {
    const app = new Koa();

    // Setup web app env from local config.
    // https://github.com/koajs/koa/blob/master/docs/api/index.md#settings
    app.env = this.config.app.env;

    // -------- Setup web middleware --------
    // Parse incoming request bodies in a middleware before your handlers,
    // available under the req.body property.
    app.use(bodyParser());

    // Generate unique request id.
    app.use(generateRequestId);

    // Basic Authentication:
    // Custom 401 handling.
    // https://github.com/koajs/basic-auth#example
    app.use(basicAuthCustom401);
    // Enable auth.
    app.use(auth({
      name: this.config.app.auth.name,
      pass: this.config.app.auth.password,
    }));

    // Inject Koa Router routes and allowed methods.
    app.use(this.web.router.routes());
    app.use(this.web.router.allowedMethods());
    return app;
  }

  async start() {
    await super.start();
    // Start HTTP server
    this.web.server = http.createServer(this.web.app.callback());
    this.web.server.listen(
      this.config.web.bind_port,
      this.config.web.bind_address,
      () => {
        const address = this.web.server.address();
        // TODO: Make sure random port setting gets overriden with actual resolved port.
        logger.info(
          `Blink Web is listening on http://${this.config.web.hostname}:${address.port} env:${this.config.app.env}`
        );
      }
    );
    // TODO: HTTPS?
  }

  async stop() {
    await super.stop();
    const address = this.web.server.address();
    this.web.server.close(() => {
      logger.info(`Blink Web is stopped http://${this.config.web.hostname}:${address.port} env:${this.config.app.env}.`);
    });
  }

}

module.exports = BlinkWebApp;
