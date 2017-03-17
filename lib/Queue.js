'use strict';

const changeCase = require('change-case')

class Queue {
  constructor(exchange) {
    this.routes = [];
    this.exchange = exchange;
    this.name = changeCase.paramCase(this.constructor.name);
  }

  pub() {
    return this;
  }

  sub() {
    return this;
  }

  async setup() {
    const result = await this.exchange.assertQueue(this);
    return result;
  }
}

module.exports = Queue;
