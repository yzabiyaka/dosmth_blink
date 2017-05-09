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
    mutant.validateStrict.should.throw(MessageValidationBlinkError,
      `child "${fieldName}" fails because ["${fieldName}" is required]`);

    mutant = MessageValidationHelper.mutate({
      change: fieldName,
      value: null,
      message: generator(),
    });
    mutant.validateStrict.should.throw(MessageValidationBlinkError,
      `child "${fieldName}" fails because ["${fieldName}" must be a string]`);

    mutant = MessageValidationHelper.mutate({
      change: fieldName,
      value: '',
      message: generator(),
    });
    mutant.validateStrict.should.throw(MessageValidationBlinkError,
      `child "${fieldName}" fails because ["${fieldName}" is not allowed to be empty]`);
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

  static defaultToNullWhenEmpty(fieldName, generator) {
    const mutant = MessageValidationHelper.mutate({
      remove: fieldName,
      message: generator(),
    });
    mutant.validateStrict();
    mutant.getData().should.have.property(fieldName).and.be.equal(null);
  }

}

module.exports = MessageValidationHelper;
