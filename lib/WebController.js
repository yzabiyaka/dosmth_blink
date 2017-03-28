'use strict';

const URL = require('url');

class WebController {
  constructor({ logger, router, web }) {
    this.logger = logger;
    this.router = router;
    this.web = web;
  }

  /**
   * Returns lambda function that executes given web method in object context
   *
   * Use this function to bind controller method to app router, example:
   *
   * router.get('apiRoot', '/api', apiController.bindTo('index'));
   *
   * @param  {String} method The name of controller method to bind
   * @return {Function}        The lambda to bind to app router
   */
  bindTo(method) {
    // Make sure web method is executed within class context.
    return async (ctx, next) => {
      this[method](ctx, next);
    };
  }

  /**
   * A helper function that returns named route as full URL
   * @param  {String} name Named route avaiable in this.router
   * @return {String}      Full route URL
   */
  fullUrl(name) {
    return URL.format({
      protocol: this.web.protocol,
      hostname: this.web.hostname,
      port: this.web.port,
      pathname: this.router.url(name),
    });
  }
}

module.exports = WebController;
