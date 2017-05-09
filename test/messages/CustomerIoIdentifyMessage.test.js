'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');

const HooksHelper = require('../helpers/HooksHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
test.beforeEach(HooksHelper.buildValidUserMessage);
test.afterEach(HooksHelper.clearValidUserMessage);

// ------- Tests ---------------------------------------------------------------

test((t) => {
  
});

// ------- End -----------------------------------------------------------------
