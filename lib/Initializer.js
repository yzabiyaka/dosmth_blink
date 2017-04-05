'use strict';

const Exchange = require('./Exchange');
const FetchQ = require('../queues/FetchQ');
const CustomerIoWebhookQ = require('../queues/CustomerIoWebhookQ');

// TODO: Think of better alternative for Initializer class
class Initializer {
  constructor(config) {
    this.config = config;
  }

  async getExchange() {
    if (this.exchange) {
      return this.exchange;
    }
    const exchange = new Exchange(this.config.amqp);
    await exchange.setup();
    this.exchange = exchange;
    return exchange;
  }

  async getFetchQ() {
    if (this.fetchQ) {
      return this.fetchQ;
    }
    const exchange = await this.getExchange();

    // TODO: think of better method of exposing Logger.
    const fetchQ = new FetchQ(exchange, this.config.logger);
    await fetchQ.setup();
    this.fetchQ = fetchQ;
    return fetchQ;
  }

  async getCustomerIoWebhookQ() {
    if (this.customerIoWebhookQ) {
      return this.customerIoWebhookQ;
    }
    const exchange = await this.getExchange();

    const customerIoWebhookQ = new CustomerIoWebhookQ(exchange);
    await customerIoWebhookQ.setup();
    this.customerIoWebhookQ = customerIoWebhookQ;
    return customerIoWebhookQ;
  }

}

module.exports = Initializer;
