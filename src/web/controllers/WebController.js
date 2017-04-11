'use strict';

const URL = require('url');

const MessageValidationError = require('../errors/MessageValidationError');

class WebController {
  constructor({ logger, router, web, initializer }) {
    this.logger = logger;
    this.router = router;
    this.web = web;
    this.initializer = initializer;
  }

  /**
   * A helper function that returns named route as full URL
   * @param  {String} name Named route avaiable in this.router
   * @return {String}      Full route URL
   */
  fullUrl(name) {
    let port = parseInt(this.web.port, 10);
    if (port === 80) {
      // Omit port 80 in URLs.
      port = null;
    }
    return URL.format({
      protocol: this.web.protocol,
      hostname: this.web.hostname,
      port,
      pathname: this.router.url(name),
    });
  }

  sendOK(ctx) {
    ctx.body = {
      ok: true,
    };
    this.log(ctx, 'OK');
  }

  sendError(ctx, error) {
    ctx.body = {
      // Not queued.
      ok: false,
    };

    // Check error type.
    if (error instanceof MessageValidationError) {
      // Machine-readable error code.
      ctx.body.error = 'validation_failed';
      ctx.body.message = error.message;
      ctx.status = 422;
    }
    this.log(ctx, error);
  }

  log(ctx, message) {
    let fullMessage = `${ctx.request.method} ${ctx.request.originalUrl} | Request ${ctx.id} | Code ${ctx.status} | ${message}`;
    if (ctx.request.method !== 'GET') {
      fullMessage += ` | Raw body ${ctx.request.rawBody}`;
    }
    this.logger.info(fullMessage);
  }
}

module.exports = WebController;
