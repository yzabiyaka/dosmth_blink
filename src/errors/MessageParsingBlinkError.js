'use strict';

const BlinkError = require('./BlinkError');

class MessageParsingBlinkError extends BlinkError {
  constructor(errorMessage, payload) {
    super(errorMessage);
    this.badPayload = `${payload}`.replace(/\n/g, '\n');;
  }
}

module.exports = MessageParsingBlinkError;
