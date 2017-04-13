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

}

module.exports = Worker;
