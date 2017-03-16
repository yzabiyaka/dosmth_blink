'use strict';

const Queue = require('../lib/Queue');

class RemoteHttpRequestQ extends Queue {
  constructor() {
    super();
  }

  pub() {
    return false;
  }

  sub() {
    return false;
  }
}

module.exports = RemoteHttpRequestQ;
