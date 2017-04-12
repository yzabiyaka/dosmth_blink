'use strict';

const Blink = require('./Blink');

class BlinkWorker extends Blink {
  constructor(config, workerName) {
    super(config);
    this.workerName = workerName;
  }

  async start() {
    await super.start();
    this.config.logger.info(`start: ${this.workerName}`);
  }
}

module.exports = BlinkWorker;
