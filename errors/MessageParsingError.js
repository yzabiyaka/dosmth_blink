'use strict';

const BlinkError = require('./BlinkError');

class MessageParsingError extends BlinkError {
  constructor(error, rawPayload) {
    super(error.message);
    super.rawPayload = rawPayload;
  }
}

module.exports = MessageParsingError;
