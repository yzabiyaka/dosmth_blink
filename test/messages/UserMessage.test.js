'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');

const DataHelper = require('../helpers/DataHelper');
const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');


// ------- Init ----------------------------------------------------------------

chai.should();

// ------- Tests ---------------------------------------------------------------

test(() => {
  DataHelper.testMessageFailsValidationWithout('id', MessageFactoryHelper.getValidUser);
});

// ------- End -----------------------------------------------------------------
