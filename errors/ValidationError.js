'use strict';

const BlinkError = require('./BlinkError');

class ValidationError extends BlinkError {
  constructor(error) {
    super(error.message);
  }
}

module.exports = ValidationError;
