'use strict';

const CustomerIoSmsActiveMessage = require('../messages/CustomerIoSmsActiveMessage');
const Queue = require('../lib/Queue');

class CustomerIoSmsStatusActiveQ extends Queue {
  constructor(...args) {
    super(...args);
    this.messageClass = CustomerIoSmsActiveMessage;
    this.routes.push('sms-status-active.customer-io.webhook');
  }
}

module.exports = CustomerIoSmsStatusActiveQ;
