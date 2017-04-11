'use strict';

const BlinkError = require('./BlinkError');

class MessageParsingBlinkError extends BlinkError {
  constructor(error, rawPayload) {
    super(error.message);
    super.rawPayload = rawPayload;
  }
}

module.exports = MessageParsingBlinkError;
