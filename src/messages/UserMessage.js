'use strict';

const Message = require('./Message');
const schema = require('../validations/userCreateAndUpdate');

class UserMessage extends Message {
  constructor(...args) {
    super(...args);
    this.schema = schema;
  }
}

module.exports = UserMessage;
