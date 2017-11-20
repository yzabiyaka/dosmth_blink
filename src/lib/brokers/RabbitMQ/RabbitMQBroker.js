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

    // AMQP channel is false when not connected.
    this.channel = false;

    // RabbitMQ exchange used for standart interfacing with queues.
    this.topicExchange = amqpConfig.options.topicExchange;
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

    // Connection succesfull.
    this.channel = this.connectionManager.getActiveChannel();

    // Create necessary exchanges.
    const assertionResult = await this.assertExchanges();
    if (!assertionResult) {
      return false;
    }

    // Everything's ready.
    return true;
  }

  async disconnect() {
    await this.connectionManager.disconnect();
  }

  // ------- Broker interface methods implementation  --------------------------


  // ------- RabbitMQ specific methods  ----------------------------------------


  // ------- Internal machinery  -----------------------------------------------

  async assertExchanges() {
    // Assert topic exchange for standart interactions.
    // We need all of them, so fail if any of this opperation isn't completed.
    try {
      // TODO: create other exchanges.
      await this.getChannel().assertExchange(this.topicExchange, 'topic');
      return true;
    } catch (error) {
      logger.error(`Couldn't assert neccessary exchanges: ${error}`, {
        code: 'error_rabbitmq_connection_broker_exchange_assertion_failed',
      });
    }
    return false;
  }

  getChannel() {
    // Todo: investigate possibity of replacing this with a
    // compatible fake when channel is not available to
    // queue requests and feed them to an active channel
    // when it's recovered.
    return this.channel;
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = RabbitMQBroker;

// ------- End -----------------------------------------------------------------
