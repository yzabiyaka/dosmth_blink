'use strict';

const CustomerIoCampaignSignupEventMessage = require('../messages/CustomerIoCampaignSignupEventMessage');
const Queue = require('./Queue');

class UserSignupEventQ extends Queue {
  constructor(...args) {
    super(...args);
    this.messageClass = CustomerIoCampaignSignupEventMessage;
    this.routes.push('signup.user.event');
  }
}

module.exports = UserSignupEventQ;
