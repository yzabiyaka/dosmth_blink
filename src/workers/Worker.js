'use strict';

const logger = require('winston');

class Worker {

  constructor(blink) {
    this.blink = blink;

    // Bind process method to queue context
    this.consume = this.consume.bind(this);
  }

  perform() {
    logger.info(`Listening for messages in "${this.queue.name}" queue`);
    // TODO: generate consumer tag
    this.queue.subscribe(this.consume);
  }

}

module.exports = Worker;
