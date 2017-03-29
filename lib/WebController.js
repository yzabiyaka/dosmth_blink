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
    const port = this.web.port !== 80 ? this.web.port : null;
    return URL.format({
      protocol: this.web.protocol,
      hostname: this.web.hostname,
      port: port,
      pathname: this.router.url(name),
    });
  }
}

module.exports = WebController;
