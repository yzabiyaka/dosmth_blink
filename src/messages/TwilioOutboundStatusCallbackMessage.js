'use strict';

const FreeFormMessage = require('./FreeFormMessage');

class TwilioOutboundStatusCallbackMessage extends FreeFormMessage {
  isError() {
    return !!this.getData().ErrorCode;
  }
  isDelivered() {
    return this.getData().Status === 'delivered';
  }
}

module.exports = TwilioOutboundStatusCallbackMessage;
