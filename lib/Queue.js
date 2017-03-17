'use strict';

const changeCase = require('change-case');

class Queue {
  constructor(exchange) {
    this.exchange = exchange;

    // Transforms Queue class name:
    // - Removes conventional Q at the end
    // - Parametrizes string
    // For example, RemoteHttpRequestQ will become remote-http-request.
    this.name = changeCase.paramCase(this.constructor.name.replace(/Q$/, ''));

    // Define route keys.
    this.routes = [];
    // Automagically create direct route to the queue using its name.
    this.routes.push(this.name);
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
