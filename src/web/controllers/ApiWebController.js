'use strict';

const WebController = require('./WebController');

class ApiWebController extends WebController {
  constructor(...args) {
    super(...args);
    // Bind web methods to object context so they can be passed to router.
    this.index = this.index.bind(this);
    this.v1 = this.v1.bind(this);
    this.welcome = this.welcome.bind(this);
  }

  async welcome(ctx) {
    ctx.body = 'Hi, I\'m Blink!';
  }

  async index(ctx) {
    ctx.body = {
      v1: this.fullUrl('api.v1'),
    };
  }

  async v1(ctx) {
    ctx.body = {
      tools: this.fullUrl('api.v1.tools'),
      events: this.fullUrl('api.v1.events'),
      webhooks: this.fullUrl('api.v1.webhooks'),
    };
  }
}

module.exports = ApiWebController;
