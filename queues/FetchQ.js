'use strict';

const Queue = require('../lib/Queue');
const FetchMessage = require('../messages/FetchMessage');

class FetchQ extends Queue {

  processIncomingMessage(incomingMessage) {
    const fetchMessage = FetchMessage.fromIncomingMessage(incomingMessage);
    fetchMessage.validate();
    // TODO: print message metadata
    this.logger.info('Message validated');
  }

}

module.exports = FetchQ;
