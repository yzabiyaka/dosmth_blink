'use strict';

const Queue = require('../lib/Queue');
const FetchMessage = require('../messages/FetchMessage');
require('isomorphic-fetch');

class FetchQ extends Queue {

  validateIncomingMessage(incomingMessage) {
    const fetchMessage = FetchMessage.fromIncomingMessage(incomingMessage);
    // Will throw MessageValidationError when not valid.
    fetchMessage.validate();
    return fetchMessage;
  }

  async process(fetchMessage) {
    const { url, options } = fetchMessage.payload.data;
    try {
      const response = await fetch(url, options);
      this.logger.info(`FetchQ.process() | ${fetchMessage.payload.meta.id} | ${response.status} ${response.statusText}`)
      this.ack(fetchMessage);
    } catch (error) {
      // Todo: retry
      this.logger.error(`FetchQ.process() | ${fetchMessage.payload.meta.id} | ${error}`)
      this.nack(fetchMessage);
    }
  }

}

module.exports = FetchQ;
