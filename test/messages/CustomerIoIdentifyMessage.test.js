'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
// const Chance = require('chance');

const MessageValidationBlinkError = require('../../src/errors/MessageValidationBlinkError');
const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');
// const MessageValidationHelper = require('../helpers/MessageValidationHelper');
const CustomerIoIdentifyMessage = require('../../src/messages/CustomerIoIdentifyMessage');


// ------- Init ----------------------------------------------------------------

chai.should();
// const chance = new Chance();
const generator = MessageFactoryHelper.getValidCustomerIoIdentify;

// ------- Tests ---------------------------------------------------------------

test('User message generator', () => {
  generator().should.be.an.instanceof(CustomerIoIdentifyMessage);
});

test('Validate a hundred fake identify messages', () => {
  let count = 100;
  while (count > 0) {
    generator().validateStrict.should.not.throw(MessageValidationBlinkError);
    count -= 1;
  }
});

// ------- End -----------------------------------------------------------------
