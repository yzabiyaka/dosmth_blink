'use strict';

const Joi = require('joi');
const uuidV4 = require('uuid/v4');

const MessageParsingBlinkError = require('../errors/MessageParsingBlinkError');
const MessageValidationBlinkError = require('../errors/MessageValidationBlinkError');

class Message {

  constructor({ data = {}, meta = {} }) {
    this.payload = { data, meta };
    // Generate unique message id or reuse request id.
    this.payload.meta.request_id = this.payload.meta.request_id || uuidV4();
  }

  toString() {
    return JSON.stringify(this.payload);
  }

  validate() {
    const { error } = Joi.validate(this.payload.data, this.schema || {});
    if (error) {
      throw new MessageValidationBlinkError(error.message, this.toString());
    }
    return true;
  }

  validateStrict() {
    const { error, value } = Joi.validate(
      this.payload.data,
      this.schema || {},
      {
        stripUnknown: true,
      }
    );
    if (error) {
      throw new MessageValidationBlinkError(error.message, this.toString());
    }
    this.payload.data = value;
    return true;
  }

  static parseIncomingPayload(incomingMessage) {
    let payload = false;
    const rawPayload = incomingMessage.content.toString();
    try {
      payload = JSON.parse(rawPayload);
    } catch (error) {
      throw new MessageParsingBlinkError(error, rawPayload);
    }
    return payload;
  }

}

module.exports = Message;
