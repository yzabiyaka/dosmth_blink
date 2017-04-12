'use strict';

const BlinkError = require('../errors/BlinkError');
const FetchWorker = require('../workers/FetchWorker');
const Blink = require('./Blink');

class BlinkWorker extends Blink {
  constructor(config, name) {
    super(config);

    const workersMapping = BlinkWorker.getAvailableWorkers();
    if (!workersMapping[name]) {
      throw new BlinkError(`Worker ${name} is not found`);
    }
    this.worker = new workersMapping[name](this);
  }

  async start() {
    await super.start();
    this.config.logger.info(`start: ${this.workerName}`);
    this.worker.startConsuming();
  }

  static getAvailableWorkers() {
    return {
      fetch: FetchWorker,
    }
  }
}

module.exports = BlinkWorker;
