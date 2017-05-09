'use strict';

const MessageValidationBlinkError = require('../../src/errors/MessageValidationBlinkError');

class MessageValidationHelper {

  static mutate({ remove, change, value, message }) {
    const mutant = message;
    if (remove) {
      delete mutant.payload.data[remove];
      return mutant;
    }
    return false;
  }

  static failsWithout(fieldName, generator) {
    let mutant;
    mutant = MessageValidationHelper.mutate({ remove: fieldName, message: generator() });
    mutant.validateStrict.should.throw(MessageValidationBlinkError, `"${fieldName}" is required`);
  }

}

module.exports = MessageValidationHelper;
