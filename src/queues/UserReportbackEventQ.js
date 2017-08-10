'use strict';

const FreeFormMessage = require('../messages/FreeFormMessage');
const Queue = require('./Queue');

class UserReportbackEventQ extends Queue {
  constructor(...args) {
    super(...args);
    this.messageClass = FreeFormMessage;
    this.routes.push('repotback.user.event');
  }
}

module.exports = UserReportbackEventQ;
