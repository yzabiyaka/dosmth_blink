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

test('User Message should fail is missing required fields', () => {
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

// ------- End -----------------------------------------------------------------
