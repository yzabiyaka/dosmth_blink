'use strict';

const BlinkError = require('./BlinkError');

class ValidationError extends BlinkError {
  constructor(fields) {
    super('Data validation failed');
    this.fields = fields;
  }
}

module.exports = ValidationError;
