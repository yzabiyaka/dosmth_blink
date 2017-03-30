'use strict';

const validate = require('validate.js');

const ValidationError = require('../errors/ValidationError');

class Message {

  constructor({ data, meta }) {
    this.data = data;
    this.meta = meta;
  }

  validate() {
    const validationErrors = validate(this.data, this.constraints || {});
    if (validationErrors) {
      throw new ValidationError(validationErrors);
    }
    return true;
  }

}

module.exports = Message;
