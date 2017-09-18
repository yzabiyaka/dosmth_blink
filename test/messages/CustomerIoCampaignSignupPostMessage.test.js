'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
// const moment = require('moment');

const CustomerIoCampaignSignupPostMessage = require('../../src/messages/CustomerIoCampaignSignupPostMessage');
// const CustomerIoEvent = require('../../src/models/CustomerIoEvent');
const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
// const expect = chai.expect;
const generator = MessageFactoryHelper.getValidCampaignSignupPost;

// ------- Tests ---------------------------------------------------------------

test('Campaign signup event message generator', () => {
  generator().should.be.an.instanceof(CustomerIoCampaignSignupPostMessage);
});

test('Campaign signup message should have toCustomerIoEvent', () => {
  generator().should.respondsTo('toCustomerIoEvent');
});

// ------- End -----------------------------------------------------------------
