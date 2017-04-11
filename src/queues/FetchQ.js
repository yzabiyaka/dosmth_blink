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

  async process(fetchMessage) {
    const { url, options } = fetchMessage.payload.data;
    try {
      const response = await fetch(url, options);
      this.logger.info(`FetchQ.process() | ${fetchMessage.payload.meta.id} | ${response.status} ${response.statusText}`);
      this.ack(fetchMessage);
      return true;
    } catch (error) {
      // Todo: retry
      this.logger.error(`FetchQ.process() | ${fetchMessage.payload.meta.id} | ${error}`);
      this.nack(fetchMessage);
    }
    return false;
  }

}

module.exports = FetchQ;
