'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const Chance = require('chance');

const MessageValidationBlinkError = require('../../src/errors/MessageValidationBlinkError');
const UserMessage = require('../../src/messages/UserMessage');
const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');
const MessageValidationHelper = require('../helpers/MessageValidationHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
const chance = new Chance();
const generator = MessageFactoryHelper.getValidUser;

// ------- Tests ---------------------------------------------------------------

test('User message generator', () => {
  generator().should.be.an.instanceof(UserMessage);
});

test('Validate a hundred fake users', () => {
  let count = 100;
  while (count > 0) {
    generator().validateStrict.should.not.throw(MessageValidationBlinkError);
    count -= 1;
  }
});

test('User Message should fail if required fields are missing, undefined, null, or empty', () => {
  [
    'id',
    'created_at',
    'updated_at',
  ]
  .forEach(field => MessageValidationHelper.failsWithout(field, generator));
});

test('User Message should remove certain optional fields when empty', () => {
  [
    'email',
    'mobile',
  ]
  .forEach(field => MessageValidationHelper.removesWhenEmpty(field, generator));
});

test('User Message should default certain optional fields when empty', () => {
  const mapping = {
    last_authenticated_at: null,
    birthdate: null,
    first_name: null,
    last_name: null,
    addr_city: null,
    addr_state: null,
    addr_zip: null,
    source: null,
    source_detail: null,
    language: null,
    country: null,
    role: 'user',
    interests: null,
    mobile_status: null,
  };
  Object.entries(mapping).forEach(([field, defaultValue]) => {
    MessageValidationHelper.defaultsToWhenEmpty(field, defaultValue, generator);
  });
});

test('User Message should fail on incorrect types', () => {
  const mapping = {
    id: chance.integer(),
    email: chance.integer(),
    mobile: chance.integer(),
    updated_at: chance.integer(),
    created_at: chance.integer(),
    last_authenticated_at: chance.integer(),
    birthdate: chance.integer(),
    first_name: chance.integer(),
    last_name: chance.integer(),
    addr_city: chance.integer(),
    addr_state: chance.integer(),
    addr_zip: chance.integer(),
    source: chance.integer(),
    source_detail: chance.integer(),
    language: chance.integer(),
    country: chance.integer(),
    role: chance.integer(),
    interests: chance.word(),
  };
  Object.entries(mapping).forEach(([field, incorrectValue]) => {
    MessageValidationHelper.ensureType(field, incorrectValue, generator);
  });
});

// ------- End -----------------------------------------------------------------
