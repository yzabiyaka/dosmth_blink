'use strict';

const Exchange = require('../lib/Exchange');
const CustomerIoWebhookQ = require('../queues/CustomerIoWebhookQ');
const FetchQ = require('../queues/FetchQ');

class Blink {
  constructor(config) {
    this.config = config;
    this.exchange = false;
    this.queues = [];
  }

  async bootstrap() {
    try {
      // Initialize and setup exchange.
      this.exchange = await this.initExchange();

      // Initialize and setup all available queues.
      this.queues = await this.initQueues([
        CustomerIoWebhookQ,
        FetchQ,
      ]);
      // this.queues = await this.initExchange();
    } catch (error) {
      this.config.logger.error(`Blink bootrstrap failed: ${error}`);
      throw error;
      // TODO: make sure everything dies
    }

    return true;
  }

  async initExchange() {
    const exchange = new Exchange(this.config.amqp);
    await exchange.setup();
    return exchange;
  }

  async initQueues(queueClasses) {
    const queuePromises = queueClasses.map(async (queueClass, i) => {
      const queueObject = new queueClasses[i](this.exchange, this.config.logger);
      // Assert Rabbit Topology.
      await queueObject.setup();
      // Return an item of 2D array for further map transformation.
      return [queueClass, queueObject];
    });

    // Map constructor to transforms a 2D key-value Array into a map.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Relation_with_Array_objects
    return new Map(await Promise.all(queuePromises));
  }
}

module.exports = Blink;
