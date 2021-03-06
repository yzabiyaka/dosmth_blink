'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const moment = require('moment');

const CampaignSignupPostMessage = require('../../../src/messages/CampaignSignupPostMessage');
const CustomerIoEvent = require('../../../src/models/CustomerIoEvent');
const MessageFactoryHelper = require('../../helpers/MessageFactoryHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
const expect = chai.expect;
const generator = MessageFactoryHelper.getCampaignSignupPostMessage;

// ------- Tests ---------------------------------------------------------------

test('Campaign signup post message generator', () => {
  generator().should.be.an.instanceof(CampaignSignupPostMessage);
});

test('Campaign signup post message should have toCustomerIoEvent', () => {
  generator().should.respondsTo('toCustomerIoEvent');
});

test('Campaign signup post message should be correctly transformed to CustomerIoEvent', () => {
  let count = 100;
  while (count > 0) {
    const msg = generator();
    const data = msg.getData();
    const cioEvent = msg.toCustomerIoEvent();

    expect(cioEvent).to.be.an.instanceof(CustomerIoEvent);

    cioEvent.getId().should.equal(data.northstar_id);
    cioEvent.getName().should.equal('campaign_signup_post');

    // Event data.
    const eventData = cioEvent.getData();
    eventData.version.should.equal(3);

    eventData.signup_post_id.should.equal(String(data.id));
    eventData.signup_id.should.equal(String(data.signup_id));
    eventData.campaign_id.should.equal(data.campaign_id);

    // If we want to test nullable properties, we need to check existence first
    if (data.quantity) eventData.quantity.should.equal(Number(data.quantity));

    // Todo: make sure TZ is corrected
    const originalCreatedAt = moment(data.created_at).milliseconds(0);
    const eventCreatedAt = moment.unix(eventData.created_at);
    eventCreatedAt.toISOString().should.be.equal(originalCreatedAt.toISOString());

    count -= 1;
  }
});

// ------- End -----------------------------------------------------------------
