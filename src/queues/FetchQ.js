'use strict';

require('isomorphic-fetch');

const FetchMessage = require('../messages/FetchMessage');
const Queue = require('./Queue');

class FetchQ extends Queue {

  // TODO: Move basic implementation to Queue class
  // eslint-disable-next-line class-methods-use-this
  validateIncomingMessage(incomingMessage) {
    const fetchMessage = FetchMessage.fromIncomingMessage(incomingMessage);
    // Will throw MessageValidationBlinkError when not valid.
    fetchMessage.validate();
    return fetchMessage;
  }

}

module.exports = FetchQ;
