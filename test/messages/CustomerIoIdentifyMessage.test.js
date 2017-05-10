'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const Chance = require('chance');

const MessageValidationBlinkError = require('../../src/errors/MessageValidationBlinkError');
const CustomerIoIdentifyMessage = require('../../src/messages/CustomerIoIdentifyMessage');
const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');
const MessageValidationHelper = require('../helpers/MessageValidationHelper');


// ------- Init ----------------------------------------------------------------

chai.should();
const chance = new Chance();
const generator = MessageFactoryHelper.getValidCustomerIoIdentify;
const mutator = function ({ remove, change, value, message }) {
  const mutant = message;
  if (remove) {
    let ref;
    if (remove === 'id') {
      ref = mutant.payload.data;
    } else {
      ref = mutant.payload.data.data;
    }
    delete ref[remove];
    return mutant;
  }
  if (change) {
    let ref;
    if (change === 'id') {
      ref = mutant.payload.data;
    } else {
      ref = mutant.payload.data.data;
    }
    ref[change] = value;
    return mutant;
  }
  return false;
};

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

test('Cio identify should fail if required fields are missing, undefined, null, or empty', () => {
  [
    'id',
    'created_at',
    'updated_at',
  ]
  .forEach(field => MessageValidationHelper.failsWithout(field, generator, mutator));
});

test('Cio identify should remove certain optional fields when empty', () => {
  [
    'mobile_status',
    'last_authenticated_at',
    'birthdate',
    'first_name',
    'last_name',
    'addr_city',
    'addr_state',
    'addr_zip',
    'source',
    'source_detail',
    'language',
    'country',
    'unsubscribed',
    'unsubscribed_at',
  ]
  .forEach(field => MessageValidationHelper.removesWhenEmpty(field, generator, mutator));
});

test.skip('Cio identify optional fields should have correct default values', () => {
  const mapping = {
    role: 'user',
    unsubscried: true,
  };
  Object.entries(mapping).forEach(([field, defaultValue]) => {
    MessageValidationHelper.defaultsToWhenEmpty(field, defaultValue, generator, mutator);
  });
});

test('Cio identify should fail on incorrect types', () => {
  const mapping = {
    id: chance.integer(),
    email: chance.integer(),
    updated_at: chance.date().toISOString(),
    created_at: chance.date().toISOString(),
    // no mobile_status
    last_authenticated_at: chance.date().toISOString(),
    birthdate: chance.timestamp(),
    first_name: chance.integer(),
    last_name: chance.integer(),
    addr_city: chance.integer(),
    addr_state: chance.integer(),
    addr_zip: chance.integer(),
    source: chance.integer(),
    source_detail: chance.integer(),
    language: chance.integer(),
    country: chance.integer(),
    unsubscribed: chance.word(),
    unsubscribed_at: chance.date().toISOString(),
    role: chance.integer(),
    interests: chance.word(),
  };
  Object.entries(mapping).forEach(([field, incorrectValue]) => {
    MessageValidationHelper.ensureType(field, incorrectValue, generator, mutator);
  });
});

// ------- End -----------------------------------------------------------------
