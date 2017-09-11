'use strict';

const CustomerIoCampaignSignupEvent = require('../messages/CustomerIoCampaignSignupEvent');
const Queue = require('./Queue');

class UserSignupEventQ extends Queue {
  constructor(...args) {
    super(...args);
    this.messageClass = CustomerIoCampaignSignupEvent;
    this.routes.push('signup.user.event');
  }
}

module.exports = UserSignupEventQ;
