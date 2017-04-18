'use strict';

const BlinkError = require('../errors/BlinkError');
const FetchWorker = require('../workers/FetchWorker');
const BlinkApp = require('./BlinkApp');

class BlinkWorkerApp extends BlinkApp {
  constructor(config, name) {
    super(config);

    const workersMapping = BlinkWorkerApp.getAvailableWorkers();
    if (!workersMapping[name]) {
      throw new BlinkError(`Worker ${name} is not found`);
    }
    this.worker = new workersMapping[name](this);
    // TODO: figure out worker names
    this.workerNname = name;
  }

  async reconnect() {
    const success = await super.reconnect();
    if (success) {
      this.worker.setup();
      this.worker.perform();
    }
  }

  static getAvailableWorkers() {
    return {
      fetch: FetchWorker,
    };
  }
}

module.exports = BlinkWorkerApp;
