'use strict';

const Joi = require('joi');
const uuidV4 = require('uuid/v4');

const MessageValidationError = require('../errors/MessageValidationError');
const MessageParsingError = require('../errors/MessageParsingError');

class Message {

  constructor({ data = {}, meta = {} }) {
    this.payload = { data, meta };
    // Generate unique message id or reuse request id.
    if (!this.payload.meta.id) {
      this.payload.meta.id = this.payload.meta.request_id || uuidV4();
    }
  }

  toString() {
    return JSON.stringify(this.payload);
  }

  validate() {
    const { error } = Joi.validate(this.payload.data, this.schema || {});
    if (error) {
      throw new MessageValidationError(error, this.toString());
    }
    return true;
  }

  static parseIncomingPayload(incomingMessage) {
    let payload = false;
    const rawPayload = incomingMessage.content.toString();
    try {
      payload = JSON.parse(rawPayload);
    } catch (error) {
      throw new MessageParsingError(error, rawPayload);
    }
    return payload;
  }

}

module.exports = Message;
