'use strict';

const BlinkError = require('./BlinkError');

class BlinkConnectionError extends BlinkError {
  constructor(message) {
    super(message);
  }
}

module.exports = BlinkConnectionError;
