'use strict';

const Joi = require('joi');

const Message = require('./Message');

class CustomerioGambitBroadcastMessage extends Message {
  constructor(...args) {
    super(...args);

    const whenNullOrEmpty = Joi.valid(['', null]);
    this.schema = Joi.object()
      .keys({
        // Note: first char of To is plus, which is resolved to a space by mistake.
        mobile: Joi.string().required().empty(whenNullOrEmpty).regex(/^\+1[0-9]+$/, 'valid phone number'),
        broadcastId: Joi.string().required().empty(whenNullOrEmpty),
      });
  }

  getBroadcastId() {
    return this.getData().broadcastId;
  }

  getPhoneNumber() {
    return this.getData().mobile;
  }
}

module.exports = CustomerioGambitBroadcastMessage;
