'use strict';

const BlinkError = require('./BlinkError');

class MessageValidationBlinkError extends BlinkError {
  constructor(error, payload) {
    super(error.message);
    this.payload = payload;
  }
}

module.exports = MessageValidationBlinkError;
