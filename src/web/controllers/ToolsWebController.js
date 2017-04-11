'use strict';

const FetchMessage = require('../../messages/FetchMessage');
const WebController = require('./WebController');

class ToolsWebController extends WebController {
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
      const fetchMessage = FetchMessage.fromCtx(ctx);
      fetchMessage.validate();
      const fetchQ = await this.initializer.getFetchQ();
      fetchQ.publish(fetchMessage);
    } catch (error) {
      this.sendError(ctx, error);
      return;
    }
    this.sendOK(ctx);
  }
}

module.exports = ToolsWebController;
