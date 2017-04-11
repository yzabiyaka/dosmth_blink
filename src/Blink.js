'use strict';

class Blink {
  constructor(config) {
    this.config = config;
  }

  initialSetup() {
    // TODO: create exchange and queueus
    this.config.logger.info('initialSetup');
  }

  bootstrapWeb() {
    this.initialSetup();
    // TODO: start web
    this.config.logger.info('bootstrapWeb');
  }

  bootstrapWorker(name) {
    this.initialSetup();
    // TODO: run worker
    this.config.logger.info(`bootstrapWorker: ${name}`);
  }
}

module.exports = Blink;
