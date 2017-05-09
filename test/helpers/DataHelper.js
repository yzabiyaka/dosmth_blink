'use strict';

const MessageValidationBlinkError = require('../../src/errors/MessageValidationBlinkError');

class DataHelper {

  static mutateMessage({ remove, change, value, message }) {
    const mutant = message;
    if (remove) {
      delete mutant.payload.data[remove];
      return mutant;
    }
    return false;
  }

  static testMessageFailsValidationWithout(fieldName, generator) {
    let mutant;
    mutant = DataHelper.mutateMessage({ remove: fieldName, message: generator() });
    mutant.validateStrict.should.throw(MessageValidationBlinkError, `"${fieldName}" is required`);
  }

}

module.exports = DataHelper;
