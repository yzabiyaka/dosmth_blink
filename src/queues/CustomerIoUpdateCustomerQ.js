'use strict';

require('isomorphic-fetch');

const UserRegistrationMessage = require('../messages/UserRegistrationMessage');
const Queue = require('./Queue');

class CustomerIoUpdateCustomerQ extends Queue {

  constructor(...args) {
    super(...args);
    this.messageClass = UserRegistrationMessage;
    this.routes = [
      UserRegistrationMessage.routingKey(),
    ];
  }

}

module.exports = CustomerIoUpdateCustomerQ;
