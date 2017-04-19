'use strict';

const CustomerIoWebhookMessage = require('../../messages/CustomerIoWebhookMessage');
const WebController = require('./WebController');

class WebHooksWebController extends WebController {
  constructor(...args) {
    super(...args);
    // Bind web methods to object context so they can be passed to router.
    this.index = this.index.bind(this);
    this.customerio = this.customerio.bind(this);
    this.gambitMdata = this.gambitMdata.bind(this);
  }

  async index(ctx) {
    ctx.body = {
      customerio: this.fullUrl('api.v1.webhooks.customerio'),
      'gambit-mdata': this.fullUrl('api.v1.webhooks.gambit-mdata'),
    };
  }

  async customerio(ctx) {
    try {
      const customerIoWebhookMessage = CustomerIoWebhookMessage.fromCtx(ctx);
      customerIoWebhookMessage.validate();
      const { customerIoWebhookQ } = this.blink.queues;
      customerIoWebhookQ.publish(customerIoWebhookMessage);
    } catch (error) {
      this.sendError(ctx, error);
      return;
    }
    this.sendOK(ctx);
  }

  async gambitMdata(ctx) {
    try {
      const mdataMessage = MdataMessage.fromCtx(ctx);
      mdataMessage.validate();
    } catch (error) {
      console.dir(error, { colors: true, showHidden: true });
      this.sendError(ctx, error);
      return;
    }
    this.sendOK(ctx);
  }
}

module.exports = WebHooksWebController;
