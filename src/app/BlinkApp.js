'use strict';

const changeCase = require('change-case');

const Exchange = require('../lib/Exchange');
const CustomerIoWebhookQ = require('../queues/CustomerIoWebhookQ');
const FetchQ = require('../queues/FetchQ');

class BlinkApp {
  constructor(config) {
    this.config = config;
    this.exchange = false;
    this.queues = [];
  }

  async start() {
    try {
      // Initialize and setup exchange.
      this.exchange = await this.setupExchange();

      // Initialize and setup all available queues.
      this.queues = await this.setupQueues([
        CustomerIoWebhookQ,
        FetchQ,
      ]);
    } catch (error) {
      this.config.logger.error(`Blink bootrstrap failed: ${error}`);
      throw error;
      // TODO: make sure everything dies
    }

    return true;
  }

  async setupExchange() {
    const exchange = new Exchange(this.config.amqp);
    await exchange.setup();
    return exchange;
  }

  async setupQueues(queueClasses) {
    const queueMappingPromises = queueClasses.map(async (queueClass, i) => {
      const queue = new queueClasses[i](this.exchange, this.config.logger);
      // Assert Rabbit Topology.
      await queue.setup();
      const mappingKey = changeCase.camelCase(queueClass.name);
      // Return an item of 2D array for further transformation.
      return [mappingKey, queue];
    });

    // Wait for all queues to be set.
    const queueMappingArray = await Promise.all(queueMappingPromises);

    // Transform resolved promises array to an object.
    const queueMapping = {};
    queueMappingArray.forEach((mapping) => {
      const [key, value] = mapping;
      queueMapping[key] = value;
    });
    return queueMapping;
  }
}

module.exports = BlinkApp;
