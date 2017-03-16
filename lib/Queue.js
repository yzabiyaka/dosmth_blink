'use strict';

class Queue {
  constructor() {
    this.routes = [];
  }

  pub() {
    return this;
  }

  sub() {
    return this;
  }
}

module.exports = Queue;
