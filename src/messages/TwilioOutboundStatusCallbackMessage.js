'use strict';

const FreeFormMessage = require('./FreeFormMessage');

class TwilioOutboundStatusCallbackMessage extends FreeFormMessage {
  isError() {
    return !!this.getData().ErrorCode;
  }
  isDelivered() {
    return this.getData().MessageStatus === 'delivered';
  }
}

module.exports = TwilioOutboundStatusCallbackMessage;
