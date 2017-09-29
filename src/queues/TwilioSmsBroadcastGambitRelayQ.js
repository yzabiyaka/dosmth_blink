'use strict';

const TwillioStatusCallbackMessage = require('../messages/TwillioStatusCallbackMessage');
const Queue = require('./Queue');

class TwilioSmsBroadcastGambitRelayQ extends Queue {
  constructor(...args) {
    super(...args);
    this.messageClass = TwillioStatusCallbackMessage;
    this.routes.push('sms-broadcast.status-callback.twilio.webhook');
  }
}

module.exports = TwilioSmsBroadcastGambitRelayQ;
