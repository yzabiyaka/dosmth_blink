'use strict';

const logger = require('winston');

const Worker = require('./Worker');

class FetchWorker extends Worker {

  constructor(blink) {
    super(blink);
    this.blink = blink;
  }

  setup() {
    this.queue = this.blink.queues.fetchQ;
  }

  async consume(fetchMessage) {
    const { url, options } = fetchMessage.payload.data;
    try {
      const response = await fetch(url, options);
      logger.info(`FetchQ.process() | ${fetchMessage.payload.meta.id} | ${response.status} ${response.statusText}`);
      this.queue.ack(fetchMessage);
      return true;
    } catch (error) {
      // Todo: retry
      logger.error(`FetchQ.process() | ${fetchMessage.payload.meta.id} | ${error}`);
      this.queue.nack(fetchMessage);
    }
    return false;
  }
}

module.exports = FetchWorker;
