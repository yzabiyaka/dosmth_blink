'use strict';

const Joi = require('joi');

const Message = require('./Message');

class CustomerIoIdentifyMessage extends Message {

  constructor(...args) {
    // super(...args);

    // // Data validation rules.
    // this.schema = Joi.object().keys({
    //   data: Joi.object().required(),
    //   event_id: Joi.string().required(),
    //   event_type: Joi.string().required(),
    //   timestamp: Joi.number().integer().required(),
    // });
  }

  static fromUser(userMessage) {
    const user = userMessage.payload.data;
    const message = {
      id: user.id,
      data: user,
    };
    const customerIoIdentifyMessage = new CustomerIoIdentifyMessage({
      data: message,
      meta: {
        request_id: userMessage.payload.meta.request_id,
      },
    });
    return customerIoIdentifyMessage;
  }

}

module.exports = CustomerIoIdentifyMessage;
