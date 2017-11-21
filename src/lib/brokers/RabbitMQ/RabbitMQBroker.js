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

  async createQueue(queueName, queueRoutes) {
    // 1. Create main queue.
    const mainQueueCreated = this.assertQueue(queueName);
    if (!mainQueueCreated) {
      return false;
    }

    // 2. Bind main queue to topic exchange.
    const mainQueueBinds = queueRoutes.map(
      async route => this.bindQueue(queueName, this.topicExchange, route),
    );
    // Execute binds promise.
    const mainQueueBound = await Promise.all(mainQueueBinds);
    // Ensure all promises are resolved to true.
    if (!mainQueueBound.every(result => result)) {
      return false;
    }

    logger.info(`Queue ${queueName} is ready.`, {
      code: 'success_rabbitmq_broker_create_queue_topic',
    });

    // TODO: create technical queues: retry and dead-letters.
    return true;
  }

  /**
   * Publish to queue using RabbitMQ wildcard routing
   *
   * Note: this works out of box only with topic exchanges and only in RabbitMQ.
   * In other brokers, we may need to compensate for lack of this
   * functionality using own routing system.
   * As an alternative, we may need to shift to direct exchanges only.
   *
   * @param  {string} route Routing key
   * @param  {object} message    Message
   * @return {bool}              The result of publishing, always true.
   */
  publishToRoute(route, message) {
    const options = {
      // The message will be returned if it is not routed to a queue.
      mandatory: true,
      // Always persistent.
      persistent: true,
    };

    // Todo: save additional message metadata?

    // TODO: handle drain and returned messages.
    // See http://www.squaremobius.net/amqp.node/channel_api.html#channel-events
    // eslint-disable-next-line no-unused-vars
    const result = this.getChannel().publish(
      this.topicExchange,
      route,
      new Buffer(message.toString(), 'utf-8'),
      options,
    );

    // Always true.
    return true;
  }

  async subscribe(queueName, callback, consumerTag = false) {
    // Explicitly define desired options.
    const options = {
      // Acknowledge mode.
      noAck: false,
      // Allow multiple consumers to listen from same queue.
      exclusive: false,
      // noLocal option is not implemented by RabbitMQ and not needed.
      // priority option is not needed.
    };
    // Todo: handle consumerTag automatically?.
    if (consumerTag) {
      // When omitted, RabbitMQ generates semi-random consumer name.
      options.consumerTag = consumerTag;
    }
    const response = await this.getChannel().consume(queueName, callback, options);
    // Todo: handle errors? return true/false?
    return response.consumerTag;
  }

  /**
   * Acknowledge message
   *
   * Note: This method works with the value of message.fields.deliveryTag.
   * @see https://github.com/squaremo/amqp.node/blob/master/lib/channel_model.js#L221
   *
   * @param  {object} message The messgage to acknowledge
   * @return {undefined}      This method is RPC and does not have server response
   */
  async ack(message) {
    // Depends on the value of message.fields.deliveryTag.
    // @see https://github.com/squaremo/amqp.node/blob/master/lib/channel_model.js#L221
    this.getChannel().ack(message);
  }

  /**
   * Negative acknowledge message
   *
   * Note: This method works with the value of message.fields.deliveryTag.
   * @see https://github.com/squaremo/amqp.node/blob/master/lib/channel_model.js#L231
   *
   * @param  {object} message The messgage to acknowledge negativly
   * @return {undefined}      This method is RPC and does not have server response
   */
  nack(message) {
    this.getChannel().reject(message, false);
  }

  // ------- RabbitMQ specific methods and mechanisms --------------------------

  async assertExchanges() {
    // Assert topic exchange for standard interactions.
    // We need all of them, so fail if any of these operations aren't successful.
    try {
      await this.getChannel().assertExchange(this.topicExchange, 'topic');
      logger.info(`Topic exchange ${this.topicExchange} asserted`, {
        code: 'success_rabbitmq_broker_topic_assert_exchange',
      });
      // TODO: create other exchanges.
      return true;
    } catch (error) {
      logger.error(`Couldn't assert neccessary exchanges: ${error}`, {
        code: 'error_rabbitmq_broker_assert_exchange_failed',
      });
    }
    return false;
  }

  async assertQueue(queueName) {
    try {
      await this.getChannel().assertQueue(queueName);
    } catch (error) {
      // Will throw an exception when queue exists with the same name,
      // but different settings.
      logger.error(`Error asserting queue ${queueName}: ${error}`, {
        code: 'error_rabbitmq_broker_assert_queue_failed',
      });
      return false;
    }

    logger.debug(`Queue ${queueName} created or already present in expected state`, {
      code: 'success_rabbitmq_broker_assert_queue',
    });
    return true;
  }

  async bindQueue(queueName, exhangeName, route) {
    try {
      await this.getChannel().bindQueue(queueName, exhangeName, route);
    } catch (error) {
      // Should never happen, but log this, just in case.
      // @see http://www.squaremobius.net/amqp.node/channel_api.html#channel_bindQueue
      logger.error(`Error binding queue ${queueName} to ${exhangeName} on ${route}: ${error}`, {
        code: 'error_rabbitmq_broker_bind_queue_unexpected',
      });
      return false;
    }

    logger.debug(`Queue ${queueName} bound to ${exhangeName} on ${route}`, {
      code: 'success_rabbitmq_broker_bind_queue',
    });
    return true;
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
