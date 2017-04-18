'use strict';

const changeCase = require('change-case');
const logger = require('winston');

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
    // TODO: log.
    try {
      // Initialize and setup exchange.
      this.exchange = await this.setupExchange();

      // Initialize and setup all available queues.
      this.queues = await this.setupQueues([
        CustomerIoWebhookQ,
        FetchQ,
      ]);
    } catch (error) {
      logger.error(`Blink bootrstrap failed: ${error}`);
      throw error;
      // TODO: make sure everything dies
    }

    return true;
  }

  async stop() {
    // TODO: log.
    this.queues = [];
    this.exchange.closed = true;
    this.exchange.channel.close();
    this.exchange.connection.close();
    this.exchange = false;
    return true;
  }

  async setupExchange() {
    const exchange = new Exchange(this.config);
    await exchange.setup();

    const socket = exchange.channel.connection.stream;
    const meta = {
      env: this.config.app.env,
      code: 'amqp_connected',
      amqp_local: `${socket.localAddress}:${socket.localPort}`,
      amqp_remote: `${socket.remoteAddress}:${socket.remotePort}`,
    };
    logger.info(`AMQP connection established`, meta);

    exchange.channel.on('error', (error) => {
      logger.warn(error);
    });

    exchange.channel.on('close', () => {
      if (this.exchange.closed) {
        return;
      }

      const meta = {
        env: this.config.app.env,
        code: 'amqp_closed_from_server',
      };
      logger.info(`AMQP connection closed from server, reconnecting`, meta);
      this.setupExchange();
    });

    return exchange;
  }

  async setupQueues(queueClasses) {
    const queueMappingPromises = queueClasses.map(async (queueClass, i) => {
      const queue = new queueClasses[i](this.exchange);
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
