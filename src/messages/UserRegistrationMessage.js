'use strict';

const Joi = require('joi');

const Message = require('./Message');


// TODO: url whitelist
// TODO: authentication
class UserRegistrationMessage extends Message {

  constructor(...args) {
    super(...args);

    // Data validation rules.
    this.schema = Joi.object().keys({
      id: Joi.string().regex(/^[0-9a-f]{24}$/, 'valid object id').required(),
    });
  }

  static fromCtx(ctx) {
    // TODO: save more metadata
    // TODO: metadata parse helper
    const userRegistrationMessage = new UserRegistrationMessage({
      data: ctx.request.body,
      meta: {
        request_id: ctx.id,
      },
    });
    return userRegistrationMessage;
  }

}

module.exports = UserRegistrationMessage;
