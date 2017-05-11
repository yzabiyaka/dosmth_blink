'use strict';

const CustomerIoWebhookMessage = require('../../messages/CustomerIoWebhookMessage');
const MdataMessage = require('../../messages/MdataMessage');
const WebController = require('./WebController');

class WebHooksWebController extends WebController {
  constructor(...args) {
    super(...args);
    // Bind web methods to object context so they can be passed to router.
    this.index = this.index.bind(this);
    this.customerioEmailActivity = this.customerioEmailActivity.bind(this);
    this.gambitChatbotMdata = this.gambitChatbotMdata.bind(this);
  }

  async index(ctx) {
    ctx.body = {
      'customerio-email-activity': this.fullUrl('api.v1.webhooks.customerio-email-activity'),
      'gambit-chatbot-mdata': this.fullUrl('api.v1.webhooks.gambit-chatbot-mdata'),
    };
  }

  async customerioEmailActivity(ctx) {
    try {
      const customerIoWebhookMessage = CustomerIoWebhookMessage.fromCtx(ctx);
      customerIoWebhookMessage.validate();
      const { quasarCustomerIoEmailActivityQ } = this.blink.queues;
      quasarCustomerIoEmailActivityQ.publish(customerIoWebhookMessage);
      this.sendOK(ctx, customerIoWebhookMessage);
    } catch (error) {
      this.sendError(ctx, error);
    }
  }

  async gambitChatbotMdata(ctx) {
    try {
      const mdataMessage = MdataMessage.fromCtx(ctx);
      mdataMessage.validate();
      const { gambitChatbotMdataQ } = this.blink.queues;
      gambitChatbotMdataQ.publish(mdataMessage);
      this.sendOK(ctx, mdataMessage);
    } catch (error) {
      this.sendError(ctx, error);
    }
  }
}

module.exports = WebHooksWebController;
