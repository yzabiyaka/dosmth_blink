'use strict';

class Blink {
  constructor(config) {
    this.config = config;
  }

  bootstrap() {
    // TODO: Parse args.
    const bootstrapLevel = process.argv[2];
    const workerName = process.argv[3];

    this.bootstrapBase();

    switch (bootstrapLevel) {
      case 'web':
        this.bootstrapWeb();
        break;
      case 'worker':
        this.bootstrapWorker(workerName);
        break;
      default:
        // error
    }
  }

  bootstrapBase() {
    // TODO: create exchange and queueus
    this.config.logger.info('bootstrapBase');
  }

  bootstrapWeb() {
    // TODO: start web
    this.config.logger.info('bootstrapWeb');
  }

  bootstrapWorker() {
    // TODO: run worker
    this.config.logger.info('bootstrapWorker');
  }

  static run(config) {
    const blink = new Blink(config);
    blink.bootstrap();
  }
}

module.exports = Blink;
