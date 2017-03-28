'use strict';

const URL = require('url');

class WebController {
  constructor({ logger, router, web }) {
    this.logger = logger;
    this.router = router;
    this.web = web;
  }

  bindTo(method) {
    // Make sure web method is executed within class context.
    return async (ctx, next) => {
      this[method](ctx, next);
    };
  }

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
