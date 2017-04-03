'use strict';

const Joi = require('joi');

const MessageValidationError = require('../errors/MessageValidationError');
const MessageParsingError = require('../errors/MessageParsingError');

class Message {

  constructor({ data = {}, meta = {} }) {
    this.payload = { data, meta };
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
