'use strict';

const BlinkError = require('./BlinkError');

class MessageValidationBlinkError extends BlinkError {
  constructor(errorMessage, payload) {
    super(errorMessage);
    this.payload = payload;
  }
}

module.exports = MessageValidationBlinkError;
