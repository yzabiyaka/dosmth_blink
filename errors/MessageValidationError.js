'use strict';

const BlinkError = require('./BlinkError');

class MessageValidationError extends BlinkError {
  constructor(error, payload) {
    super(error.message);
    this.payload = payload;
  }
}

module.exports = MessageValidationError;
