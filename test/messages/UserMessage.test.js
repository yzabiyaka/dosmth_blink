'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const faker = require('faker');

const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');
const MessageValidationHelper = require('../helpers/MessageValidationHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
const generator = MessageFactoryHelper.getValidUser;

// ------- Tests ---------------------------------------------------------------

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
  };
  Object.entries(mapping).forEach(([field, defaultValue]) => {
    MessageValidationHelper.defaultsToWhenEmpty(field, defaultValue, generator);
  });
});

test('User Message should fail on incorrect types', () => {
  const mapping = {
    id: faker.random.number(),
    email: faker.random.number(),
    mobile: faker.random.number(),
    updated_at: faker.random.number(),
    created_at: faker.random.number(),
    last_authenticated_at: faker.random.number(),
    birthdate: faker.random.number(),
    first_name: faker.random.number(),
    last_name: faker.random.number(),
    addr_city: faker.random.number(),
    addr_state: faker.random.number(),
    addr_zip: faker.random.number(),
    source: faker.random.number(),
    source_detail: faker.random.number(),
    language: faker.random.number(),
    country: faker.random.number(),
    role: faker.random.number(),
    interests: faker.random.word(),
  };
  Object.entries(mapping).forEach(([field, incorrectValue]) => {
    MessageValidationHelper.ensureType(field, incorrectValue, generator);
  });
});

// ------- End -----------------------------------------------------------------
