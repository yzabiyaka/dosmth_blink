'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');

const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');
const MessageValidationHelper = require('../helpers/MessageValidationHelper');


// ------- Init ----------------------------------------------------------------

chai.should();

// ------- Tests ---------------------------------------------------------------

test(() => {
  MessageValidationHelper.failsWithout('id', MessageFactoryHelper.getValidUser);
});

// ------- End -----------------------------------------------------------------
