'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const Chance = require('chance');

const CustomerIoCampaignSignupEventMessage = require('../../src/messages/CustomerIoCampaignSignupEventMessage');
const CustomerIoEvent = require('../../src/models/CustomerIoEvent');
const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
const expect = chai.expect;
const chance = new Chance();
const generator = MessageFactoryHelper.getValidCampaignSignupEvent;
const mutator = function ({ remove, change, value, message }) {
  const mutant = message;
  if (remove) {
    delete mutant.payload.data[remove];
    return mutant;
  }
  if (change) {
    mutant.payload.data[change] = value;
    return mutant;
  }
  return false;
};


// ------- Tests ---------------------------------------------------------------

test('Campaign signup event message generator', () => {
  generator().should.be.an.instanceof(CustomerIoCampaignSignupEventMessage);
});

test('Campaign signup message should have toCustomerIoEvent', () => {
  generator().should.respondsTo('toCustomerIoEvent');
});

test('Campaign signup message should be correctly transformed to CustomerIoEvent', () => {
  const msg = generator();
  const data = msg.getData();
  const cioEvent = msg.toCustomerIoEvent();

  expect(cioEvent).to.be.an.instanceof(CustomerIoEvent);
});

// ------- End -----------------------------------------------------------------
