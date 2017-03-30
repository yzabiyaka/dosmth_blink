'use strict';

const WebController = require('../../lib/WebController');

class ToolsController extends WebController {
  constructor(...args) {
    super(...args);
    // Bind web methods to object context so they can be passed to router.
    this.index = this.index.bind(this);
    this.fetch = this.fetch.bind(this);
  }

  async index(ctx) {
    ctx.body = {
      fetch: this.fullUrl('api.v1.tools.fetch'),
    };
  }

  async fetch(ctx) {
    try {
      const msg = new FetchMessage(ctx.request.body);
    } catch (error) {
      this.sendError(ctx, error);
      return;
    }
    console.dir(ctx.request.body, { colors: true, showHidden: true });
    this.sendOK(ctx);
  }
}

module.exports = ToolsController;
