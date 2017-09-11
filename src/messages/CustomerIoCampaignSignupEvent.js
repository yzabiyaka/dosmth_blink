'use strict';

const Joi = require('joi');

const Message = require('./Message');
const MessageParsingBlinkError = require('../errors/MessageParsingBlinkError');

class CustomerIoCampaignSignupEventMessage extends Message {
  constructor(...args) {
    super(...args);

    this.schema = Joi.object()
      // Allow presence of all other keys.
      .unknown();
  }

  static fromCtx(ctx) {
    // TODO: save more metadata
    // TODO: metadata parse helper
    const message = new CustomerIoCampaignSignupEventMessage({
      data: ctx.request.body,
      meta: {
        request_id: ctx.id,
      },
    });
    return message;
  }

  static fromRabbitMessage(rabbitMessage) {
    const payload = this.parseIncomingPayload(rabbitMessage);
    if (!payload.data || !payload.meta) {
      throw new MessageParsingBlinkError('No data in message', payload);
    }

    // TODO: save more metadata
    // TODO: metadata parse helper
    const message = new CustomerIoCampaignSignupEventMessage({
      data: payload.data,
      meta: payload.meta,
    });
    message.fields = rabbitMessage.fields;
    return message;
  }
}

module.exports = CustomerIoCampaignSignupEventMessage;
