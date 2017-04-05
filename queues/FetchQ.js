'use strict';

const Queue = require('../lib/Queue');
const FetchMessage = require('../messages/FetchMessage');

class FetchQ extends Queue {

  validateIncomingMessage(incomingMessage) {
    const fetchMessage = FetchMessage.fromIncomingMessage(incomingMessage);
    // Will throw MessageValidationError when not valid.
    fetchMessage.validate();
    
    return fetchMessage;
  }

}

module.exports = FetchQ;
