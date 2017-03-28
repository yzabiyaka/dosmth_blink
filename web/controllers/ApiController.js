'use strict';

class ApiController {
  static async index(ctx) {
    ctx.body = {
      v1: '/api/v1',
    };
  }

  static async v1(ctx) {
    ctx.body = {};
  }
}

module.exports = ApiController;
