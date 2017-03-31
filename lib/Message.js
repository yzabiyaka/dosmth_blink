'use strict';

const Joi = require('joi');

const ValidationError = require('../errors/ValidationError');

class Message {

  constructor({ data, meta = {} }) {
    this.payload = { data, meta };
  }

  toString() {
    return JSON.stringify(this.payload);
  }

  validate() {
    const { error } = Joi.validate(this.payload.data, this.schema || {});
    if (error) {
      throw new ValidationError(error);
    }
    return true;
  }

}

module.exports = Message;
