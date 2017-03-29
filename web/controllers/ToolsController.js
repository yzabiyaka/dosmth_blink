'use strict';

const WebController = require('../../lib/WebController');

class ToolsController extends WebController {
  constructor(...args) {
    super(...args);
    // Bind web methods to object context so they can be passed to router.
    this.index = this.index.bind(this);
  }

  async index(ctx) {
    ctx.body = {};
  }
}

module.exports = ToolsController;
