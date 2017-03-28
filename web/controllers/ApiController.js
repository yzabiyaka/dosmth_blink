'use strict';

const WebController = require('../../lib/WebController');

class ApiController extends WebController {
  async index(ctx) {
    ctx.body = {
      v1: this.fullUrl('v1'),
    };
  }

  async v1(ctx) {
    ctx.body = {};
  }
}

module.exports = ApiController;
