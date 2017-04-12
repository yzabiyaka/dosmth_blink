'use strict';

const URL = require('url');

const MessageValidationBlinkError = require('../../errors/MessageValidationBlinkError');

class WebController {
  constructor(blink) {
    this.logger = blink.config.logger;
    this.web = blink.config.web;
    this.blink = blink;
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
      pathname: this.blink.web.router.url(name),
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
    if (error instanceof MessageValidationBlinkError) {
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
