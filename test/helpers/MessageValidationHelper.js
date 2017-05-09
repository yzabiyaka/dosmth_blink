'use strict';

const MessageValidationBlinkError = require('../../src/errors/MessageValidationBlinkError');

class MessageValidationHelper {

  static mutate({ remove, change, value, message }) {
    const mutant = message;
    if (remove) {
      delete mutant.payload.data[remove];
      return mutant;
    }
    if (change) {
      mutant.payload.data[change] = value;
      return mutant;
    }
    return false;
  }

  static failsWithout(fieldName, generator) {
    let mutant;
    mutant = MessageValidationHelper.mutate({
      remove: fieldName,
      message: generator(),
    });
    mutant.validateStrict.should.throw(MessageValidationBlinkError, `"${fieldName}" is required`);

    mutant = MessageValidationHelper.mutate({
      change: fieldName,
      value: undefined,
      message: generator(),
    });
    mutant.validateStrict.should.throw(MessageValidationBlinkError, `"${fieldName}" is required`);

    mutant = MessageValidationHelper.mutate({
      change: fieldName,
      value: null,
      message: generator(),
    });
    mutant.validateStrict.should.throw(MessageValidationBlinkError, `"${fieldName}" is required`);

    mutant = MessageValidationHelper.mutate({
      change: fieldName,
      value: '',
      message: generator(),
    });
    mutant.validateStrict.should.throw(MessageValidationBlinkError, `"${fieldName}" is required`);
  }

  static removesWhenEmpty(fieldName, generator) {
    let mutant;

    mutant = MessageValidationHelper.mutate({
      change: fieldName,
      value: '',
      message: generator(),
    });
    mutant.validateStrict();
    mutant.getData().should.not.have.property(fieldName);

    mutant = MessageValidationHelper.mutate({
      change: fieldName,
      value: null,
      message: generator(),
    });
    mutant.validateStrict();
    mutant.getData().should.not.have.property(fieldName);
  }

  static defaultsToWhenEmpty(fieldName, defaultValue, generator) {
    const mutant = MessageValidationHelper.mutate({
      remove: fieldName,
      message: generator(),
    });
    mutant.validateStrict();
    mutant.getData().should.have.property(fieldName).and.be.equal(defaultValue);
  }


  static ensureType(fieldName, incorrectValue, generator) {
    const mutant = MessageValidationHelper.mutate({
      change: fieldName,
      value: incorrectValue,
      message: generator(),
    });
    mutant.validateStrict.should.throw(MessageValidationBlinkError, `"${fieldName}" must be a`);
  }

}

module.exports = MessageValidationHelper;
