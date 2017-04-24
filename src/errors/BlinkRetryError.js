'use strict';

const BlinkError = require('./BlinkError');

class BlinkRetryError extends BlinkError {
  constructor(errorMessage, blinkMessage) {
    super(errorMessage);
    this.blinkMessage = blinkMessage;
  }
}

module.exports = BlinkRetryError;
