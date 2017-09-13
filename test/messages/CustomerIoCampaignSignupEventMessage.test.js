'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const moment = require('moment');

const CustomerIoCampaignSignupEventMessage = require('../../src/messages/CustomerIoCampaignSignupEventMessage');
const CustomerIoEvent = require('../../src/models/CustomerIoEvent');
const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
const expect = chai.expect;
const generator = MessageFactoryHelper.getValidCampaignSignupEvent;

// ------- Tests ---------------------------------------------------------------

test('Campaign signup event message generator', () => {
  generator().should.be.an.instanceof(CustomerIoCampaignSignupEventMessage);
});

test('Campaign signup message should have toCustomerIoEvent', () => {
  generator().should.respondsTo('toCustomerIoEvent');
});

test('Campaign signup message should be correctly transformed to CustomerIoEvent', () => {
  let count = 100;
  while (count > 0) {
    const msg = generator();
    const data = msg.getData();
    const cioEvent = msg.toCustomerIoEvent();

    expect(cioEvent).to.be.an.instanceof(CustomerIoEvent);

    cioEvent.getId().should.equal(data.northstar_id);
    cioEvent.getName().should.equal('campaign_signup');
    const eventData = cioEvent.getData();

    eventData.signup_id.should.equal(data.id);
    eventData.campaign_id.should.equal(data.campaign_id);
    eventData.campaign_run_id.should.equal(data.campaign_run_id);

    // Todo: make sure TZ is corrected
    const originalCreatedAt = moment(data.created_at).milliseconds(0);
    const eventCreatedAt = moment.unix(eventData.created_at);
    eventCreatedAt.toISOString().should.be.equal(originalCreatedAt.toISOString());

    if (data.source) {
      expect(eventData.source).to.be.equal(data.source);
    }
    count -= 1;
  }
});

// ------- End -----------------------------------------------------------------
