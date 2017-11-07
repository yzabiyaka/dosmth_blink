'use strict';

const Joi = require('joi');

const Message = require('./Message');
const MessageParsingBlinkError = require('../errors/MessageParsingBlinkError');

class CustomerioSmsBroadcastMessage extends Message {
  constructor(...args) {
    super(...args);

    const whenNullOrEmpty = Joi.valid(['', null]);
    const statusRegex = /broadcastId%3D.+$/;
    this.schema = Joi.object()
      .keys({
        To: Joi.string().required().empty(whenNullOrEmpty).regex(/^\+1[0-9]+$/, 'valid phone number'),
        Body: Joi.string().required().empty(whenNullOrEmpty),
        MessagingServiceSid: Joi.string().required().empty(whenNullOrEmpty),
        StatusCallback:Joi.string().required().empty(whenNullOrEmpty).regex(statusRegex, 'valid status callback'),
      });
  }

  getBroadcastId() {
    return this.getData().StatusCallback.match(/broadcastId%3D(.+)/)[1];
  }

  static fromCtx(ctx) {
    console.dir(ctx.request.body, { colors: true, showHidden: true });
    // TODO: save more metadata
    // TODO: metadata parse helper
    const meta = {
      request_id: ctx.id,
    };
    const message = new CustomerioSmsBroadcastMessage({
      data: ctx.request.body,
      meta,
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
    const message = new CustomerioSmsBroadcastMessage({
      data: payload.data,
      meta: payload.meta,
    });
    message.fields = rabbitMessage.fields;
    return message;
  }
}

module.exports = CustomerioSmsBroadcastMessage;
