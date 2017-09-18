'use strict';

const CustomerIoCampaignSignupMessage = require('../messages/CustomerIoCampaignSignupMessage');
const Queue = require('./Queue');

class UserSignupEventQ extends Queue {
  constructor(...args) {
    super(...args);
    this.messageClass = CustomerIoCampaignSignupMessage;
    this.routes.push('signup.user.event');
  }
}

module.exports = UserSignupEventQ;
