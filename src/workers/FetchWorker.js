'use strict';

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

  // TODO: better logging
  // async consume(rawMessage) {
  //   try {
  //     // Will throw MessageValidationBlinkError when not valid.
  //     // const message = this.queue.validateIncomingMessage(incomingMessage);
  //     // TODO: print message metadata
  //     this.logger.info(`Message valid | ${validMessage.payload.meta.id}`);
  //     const processResult = await this.process(validMessage);
  //     if (processResult) {
  //       this.logger.info(`Message processed | ${validMessage.payload.meta.id}`);
  //     } else {
  //       this.logger.info(`Message not processed | ${validMessage.payload.meta.id}`);
  //     }
  //   } catch (error) {
  //     if (error instanceof MessageParsingBlinkError) {
  //       this.logger.error(`Queue ${this.name}: can't parse payload, reason: "${error}", payload: "${error.rawPayload}"`);
  //     } else if (error instanceof MessageValidationBlinkError) {
  //       this.logger.error(`Queue ${this.name}: message validation error: "${error}", payload: "${error.payload}"`);
  //     } else {
  //       this.logger.error(`Queue ${this.name} uncaught exception ${error}`);
  //     }

  //     // TODO: send to dead letters?
  //     this.queue.nack(incomingMessage);
  //   }
  // }
}

module.exports = FetchWorker;
