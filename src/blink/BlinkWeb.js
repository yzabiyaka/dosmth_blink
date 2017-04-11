'use strict';

const Blink = require('./Blink');

class BlinkWeb extends Blink {
  constructor(config) {
    super(config);
  }

  async bootstrap() {
    await super.bootstrap();
    this.config.logger.info('bootstrapWeb');
  }
}

module.exports = BlinkWeb;
