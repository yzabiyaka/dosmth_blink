'use strict';

class Queue {
  constructor(exchange) {
    this.routes = [];
    this.exchange = exchange;
  }

  pub() {
    return this;
  }

  sub() {
    return this;
  }

  async setup() {
    const result = await this.exchange.assertQueue(this);
    console.dir(result, { colors: true, showHidden: true });
    return result;
  }
}

module.exports = Queue;
