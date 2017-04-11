'use strict';

const Blink = require('./Blink');

class BlinkWorker extends Blink {
  constructor(config, workerName) {
    super(config);
    this.workerName = workerName;
  }

  async bootstrap() {
    await super.bootstrap();
    this.config.logger.info(`bootstrapWorker: ${this.name}`);
  }
}

module.exports = BlinkWorker;
