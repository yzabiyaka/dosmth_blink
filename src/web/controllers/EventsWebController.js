'use strict';

const UserMessage = require('../../messages/UserMessage');
const WebController = require('./WebController');

class EventsWebController extends WebController {
  constructor(...args) {
    super(...args);
    // Bind web methods to object context so they can be passed to router.
    this.index = this.index.bind(this);
    this.userRegistration = this.userRegistration.bind(this);
  }

  async index(ctx) {
    ctx.body = {
      'user-registration': this.fullUrl('api.v1.events.user-registration'),
    };
  }

  async userRegistration(ctx) {
    try {
      const userMessage = UserMessage.fromCtx(ctx);
      userMessage.validate();
      this.blink.exchange.publish(
        'registration.user.event',
        userMessage
      );
    } catch (error) {
      this.sendError(ctx, error);
      return;
    }
    this.sendOK(ctx);
  }
}

module.exports = EventsWebController;
