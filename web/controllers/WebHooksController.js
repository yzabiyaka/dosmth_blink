'use strict';

const FetchMessage = require('../../messages/FetchMessage');
const WebController = require('../../lib/WebController');

class WebHooksController extends WebController {
  constructor(...args) {
    super(...args);
    // Bind web methods to object context so they can be passed to router.
    this.index = this.index.bind(this);
    this.customerio = this.customerio.bind(this);
  }

  async index(ctx) {
    ctx.body = {
      customerio: this.fullUrl('api.v1.webhooks.customerio'),
    };
  }

  async customerio(ctx) {
    // try {
    //   const fetchMessage = FetchMessage.fromCtx(ctx);
    //   fetchMessage.validate();
    //   const fetchQ = await this.initializer.getFetchQ();
    //   fetchQ.publish(fetchMessage);
    // } catch (error) {
    //   this.sendError(ctx, error);
    //   return;
    // }
    this.sendOK(ctx);
  }
}

module.exports = WebHooksController;
