'use strict';

const URL = require('url');

class WebController {
  constructor({ logger, router, web }) {
    this.logger = logger;
    this.router = router;
    this.web = web;
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

  static replyOK(ctx) {
    ctx.body = {
      ok: true,
    };
  }
}

module.exports = WebController;
