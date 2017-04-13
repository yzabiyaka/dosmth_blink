'use strict';

class Worker {

  constructor(blink) {
    this.logger = blink.config.logger;
    this.blink = blink;

    // Bind process method to queue context
    this.consume = this.consume.bind(this);
  }

  perform() {
    this.logger.info(`Listening for messages in "${this.queue.name}" queue`);
    // TODO: generate consumer tag
    this.queue.subscribe(this.consume);
  }

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

module.exports = Worker;
