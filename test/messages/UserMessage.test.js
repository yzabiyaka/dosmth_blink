'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');

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

test('User Message should reset certain optional fields to null when empty', () => {
  [
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
    'interests',
  ].forEach(field => MessageValidationHelper.defaultToNullWhenEmpty(field, generator));
});

// ------- End -----------------------------------------------------------------
