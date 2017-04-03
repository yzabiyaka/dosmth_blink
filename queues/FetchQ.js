'use strict';

const Queue = require('../lib/Queue');
const FetchMessage = require('../messages/FetchMessage');

class FetchQ extends Queue {



  processIncomingMessage(incomingMessage) {
    const fetchMessage = FetchMessage.fromIncomingMessage(incomingMessage);
    fetchMessage.validate();
    console.dir(fetchMessage.payload.data, { colors: true, showHidden: true });
  }

}

module.exports = FetchQ;
