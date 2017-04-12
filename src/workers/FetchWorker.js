'use strict';

const Worker = require('./Worker');

class FetchWorker extends Worker {

  async process(fetchMessage) {
    const { url, options } = fetchMessage.payload.data;
    try {
      const response = await fetch(url, options);
      this.logger.info(`FetchQ.process() | ${fetchMessage.payload.meta.id} | ${response.status} ${response.statusText}`);
      this.queue.ack(fetchMessage);
      return true;
    } catch (error) {
      // Todo: retry
      this.logger.error(`FetchQ.process() | ${fetchMessage.payload.meta.id} | ${error}`);
      this.queue.nack(fetchMessage);
    }
    return false;

  }
}

module.exports = FetchWorker;
