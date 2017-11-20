'use strict';

// ------- Imports -------------------------------------------------------------

const logger = require('winston');

// ------- Internal imports ----------------------------------------------------

const Broker = require('../Broker');
const DelayLogic = require('../../DelayLogic');
const ReconnectManager = require('../../ReconnectManager');
const RabbitMQConnectionManager = require('./RabbitMQConnectionManager');

// ------- Class ---------------------------------------------------------------

class RabbitMQBroker extends Broker {
  constructor(amqpConfig, clientDescription = false) {
    super();
    // Initialize reconnect manager suitable for RabbitMQ.
    // Anecdotally, Constant time backoff every 2 seconds works best.
    // TODO: confirm if that's true.
    const reconnectManager = new ReconnectManager(
      DelayLogic.constantTimeDelay(2000),
    );

    // TODO: use options array instead of clientDescription.
    this.connectionManager = new RabbitMQConnectionManager(
      amqpConfig.connection,
      clientDescription,
      reconnectManager,
    );

    // RabbitMQ exchange used for standart interfacing with queues.
    this.topicExchange = amqpConfig.settings.topicExchange;
  }

  // ------- Public API  -------------------------------------------------------

  /**
   * Create managed RabbitMQ connection
   */
  async connect() {
    // Create managed RabbitMQ connection.
    const connectionResult = await this.connectionManager.connect();
    if (!connectionResult) {
      return false;
    }

    // To perform normal operations, RabbitMQ needs exchanges.
    // Without them, we're as good, as disconnected, so treat
    // their assertion as a step of connecting to RabbitMQ.
    // May make sense to move this to Broker.setup() if there are more
    // use-cases for this in other broker implementations.
    const exchangesAreReady = await this.assertExchanges();
    if (!exchangesAreReady) {
      return false;
    }

    // Everything's ready.
    return true;
  }

  async disconnect() {
    await this.connectionManager.disconnect();
  }

  // ------- Broker interface methods implementation  --------------------------

  async assertQueue(queue) {

  }

  // ------- RabbitMQ specific methods  ----------------------------------------


  // ------- Internal machinery  -----------------------------------------------

  async assertExchanges() {
    // Assert topic exchange for standard interactions.
    // We need all of them, so fail if any of these operations aren't successful.
    try {
      await this.getChannel().assertExchange(this.topicExchange, 'topic');
      logger.info(`Topic exchange asserted: ${this.topicExchange}`, {
        code: 'success_rabbitmq_broker_topic_exchange_asserted',
      });
      // TODO: create other exchanges.
      return true;
    } catch (error) {
      logger.error(`Couldn't assert neccessary exchanges: ${error}`, {
        code: 'error_rabbitmq_broker_exchange_assertion_failed',
      });
    }
    return false;
  }

  getChannel() {
    // Todo: investigate possibility of replacing this with a
    // compatible fake when channel is not available to
    // queue requests and feed them to an active channel
    // when it's recovered.
    return this.connectionManager.getActiveChannel();
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = RabbitMQBroker;

// ------- End -----------------------------------------------------------------
