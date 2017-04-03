'use strict';

const Queue = require('../lib/Queue');
const FetchMessage = require('../messages/FetchMessage');

class FetchQ extends Queue {



  processIncomingMessage(incomingMessage) {
    const fetchMessage = FetchMessage.fromIncomingMessage(incomingMessage);
  }

}

module.exports = FetchQ;
