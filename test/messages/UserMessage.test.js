'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');

const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');
const MessageValidationHelper = require('../helpers/MessageValidationHelper');


// ------- Init ----------------------------------------------------------------

chai.should();

// ------- Tests ---------------------------------------------------------------

test('User Message should fail is missing required fields', () => {
  ['id', 'created_at', 'updated_at'].forEach((field) => {
    MessageValidationHelper.failsWithout(field, MessageFactoryHelper.getValidUser);
  });
});

// ------- End -----------------------------------------------------------------
