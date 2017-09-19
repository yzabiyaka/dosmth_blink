'use strict';

const CustomerIoCampaignSignupPostMessage = require('../messages/CustomerIoCampaignSignupPostMessage');
const Queue = require('./Queue');

class UserSignupPostEventQ extends Queue {
  constructor(...args) {
    super(...args);
    this.messageClass = CustomerIoCampaignSignupPostMessage;
    this.routes.push('signup-post.user.event');
  }
}

module.exports = UserSignupPostEventQ;
