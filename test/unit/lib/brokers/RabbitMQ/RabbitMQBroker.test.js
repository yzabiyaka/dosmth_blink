'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const Chance = require('chance');
const sinonChai = require('sinon-chai');

// ------- Internal imports ----------------------------------------------------

const RabbitMQBroker = require('../../../../../src/lib/brokers/RabbitMQ/RabbitMQBroker');
const MessageFactoryHelper = require('../../../../helpers/MessageFactoryHelper');
const UnitHooksHelper = require('../../../../helpers/UnitHooksHelper');

// ------- Init ----------------------------------------------------------------

const chance = new Chance();

chai.should();
chai.use(sinonChai);

// Prepare fakes for each test and clean up after them.
test.beforeEach(UnitHooksHelper.createFakeRabbitMQBroker);
test.afterEach.always(UnitHooksHelper.destroyFakeRabbitMQBroker);

// ------- Tests ---------------------------------------------------------------

/**
 * Dequeuer: constructor()
 */
test('RabbitMQBroker: Should implement Broker interface', () => {
  const broker = new RabbitMQBroker({});
  broker.should.respondTo('connect');
  broker.should.respondTo('disconnect');
  broker.should.respondTo('publishToRoute');
  broker.should.respondTo('subscribe');
  broker.should.respondTo('ack');
  broker.should.respondTo('nack');
  broker.should.respondTo('createQueue');
  broker.should.respondTo('purgeQueue');
  broker.should.respondTo('deleteQueue');
});

/**
 * RabbitMQBroker: ack()
 */
test('RabbitMQBroker.ack(): Should delegate message ack to amqplib', (t) => {
  // Set variables from the context.
  const { sandbox, channel, broker } = t.context;

  // Stub channel.sendImmediately() that sends all synchronous requests
  // the socket.
  // @see https://github.com/squaremo/amqp.node/blob/master/lib/channel.js#L63
  const sendImmediatelyStub = sandbox.stub(channel, 'sendImmediately').returns(42);

  // Spy on ack. We don't need to replace this completely, as it
  // uses channel.sendImmediately() to perform actual call.
  // @see https://github.com/squaremo/amqp.node/blob/master/lib/channel_model.js#L218
  const ackSpy = sandbox.spy(channel, 'ack');

  // Prepare fake message to acknowledgement.
  const message = MessageFactoryHelper.getFakeRabbitMessage();
  // AMQPLib's ack method implicitly depends on mesaage.fields.deliveryTag.
  // We'll ensure it works correctly by by spying on sendImmediately();
  message.fields.deliveryTag.should.be.not.empty;
  // Acknowledge the fake message.
  broker.ack(message);

  // Ack should be called.
  ackSpy.should.have.been.calledOnce;

  // Channel.ack() should pass message delivery tag to sendImmediately().
  sendImmediatelyStub.should.have.been.calledOnce;
  // Arg[0] = operation code, arg[1] = arguments object.
  const deliveryTagCallArgument = sendImmediatelyStub.firstCall.args[1].deliveryTag;
  message.fields.deliveryTag.should.be.equal(deliveryTagCallArgument);
});

/**
 * RabbitMQBroker: nack()
 */
test('RabbitMQBroker.nack(): Should delegate message nack to amqplib', (t) => {
  // Set variables from the context.
  const { sandbox, channel, broker } = t.context;

  // Stub channel.sendImmediately() that sends all synchronous requests
  // the socket.
  // @see https://github.com/squaremo/amqp.node/blob/master/lib/channel.js#L63
  const sendImmediatelyStub = sandbox.stub(channel, 'sendImmediately').returns(42);

  // Spy on reject. We don't need to replace this completely, as it
  // uses channel.sendImmediately() to perform actual call.
  // @see https://github.com/squaremo/amqp.node/blob/master/lib/channel_model.js#L243
  const rejectSpy = sandbox.spy(channel, 'reject');

  // Prepare fake message to acknowledgement.
  const message = MessageFactoryHelper.getFakeRabbitMessage();
  // AMQPLib's reject() method implicitly depends on mesaage.fields.deliveryTag.
  // We'll ensure it works correctly by by spying on sendImmediately();
  message.fields.deliveryTag.should.be.not.empty;
  // Negative acknowledge the fake message.
  broker.nack(message);

  // Reject should be called.
  rejectSpy.should.have.been.calledOnce;

  // Channel.reject() should pass message delivery tag to sendImmediately().
  sendImmediatelyStub.should.have.been.calledOnce;
  // Arg[0] = operation code, arg[1] = arguments object.
  const deliveryTagCallArgument = sendImmediatelyStub.firstCall.args[1].deliveryTag;
  message.fields.deliveryTag.should.be.equal(deliveryTagCallArgument);
});

/**
 * RabbitMQBroker: createQueue()
 */
test('RabbitMQBroker.createQueue(): Happy path', async (t) => {
  // Set variables from the context.
  const { sandbox, channel, broker } = t.context;

  // Define test parameters.
  const queueName = chance.word();
  const numberOfRoutes = 5;
  const queueRoutes = chance.n(chance.word, numberOfRoutes);

  // Stub amqplib's assertQueue().
  // Response example take from the docs.
  // @see http://www.squaremobius.net/amqp.node/channel_api.html#channel_assertQueue
  const assertQueueStub = sandbox.stub(channel, 'assertQueue').resolves({
    queue: queueName,
    messageCount: 0,
    consumerCount: 0,
  });

  // Stub amqplib's bindQueue().
  // The server reply resolves to an empty object.
  // @see http://www.squaremobius.net/amqp.node/channel_api.html#channel_bindExchange
  const bindQueueStub = sandbox.stub(channel, 'bindQueue').resolves({});

  // Execute the function.
  const result = await broker.createQueue(queueName, queueRoutes);
  result.should.be.true;

  // Ensure queue assertion has been called.
  assertQueueStub.should.have.been.calledOnce;

  // Ensure the queue has been bound to the topic exchange on expected routes.
  bindQueueStub.should.have.callCount(numberOfRoutes);
  for (const [queueArg, exchangeArg, routeArg] of bindQueueStub.args) {
    queueArg.should.equal(queueName);
    exchangeArg.should.equal(broker.topicExchange);
    routeArg.should.be.oneOf(queueRoutes);
  }
});

/**
 * RabbitMQBroker: purgeQueue()
 */
test('RabbitMQBroker.purgeQueue(): Happy path', async (t) => {
  // Set variables from the context.
  const { sandbox, channel, broker } = t.context;

  // Define test parameters.
  const queueName = chance.word();
  const messageCount = chance.integer({ min: 1 });

  // Stub amqplib's purgeQueue().
  // Response example take from the docs.
  // http://www.squaremobius.net/amqp.node/channel_api.html#channel_purgeQueue
  const purgeQueueStub = sandbox.stub(channel, 'purgeQueue').resolves({
    messageCount,
  });

  // Execute the function.
  const result = await broker.purgeQueue(queueName);
  result.should.equal(messageCount);

  // Ensure queue purging has been correctly delegated to amqplib.
  purgeQueueStub.should.have.been.calledOnce;
  purgeQueueStub.should.have.been.calledWithExactly(queueName);
});

/**
 * RabbitMQBroker: deleteQueue()
 */
test('RabbitMQBroker.deleteQueue(): Happy path', async (t) => {
  // Set variables from the context.
  const { sandbox, channel, broker } = t.context;

  // Define test parameters.
  const queueName = chance.word();
  const messageCount = chance.integer({ min: 1 });

  // Stub amqplib's deleteQueue().
  // Response example take from the docs.
  // http://www.squaremobius.net/amqp.node/channel_api.html#channel_deleteQueue
  const deleteQueueStub = sandbox.stub(channel, 'deleteQueue').resolves({
    messageCount,
  });

  // Execute the function.
  const result = await broker.deleteQueue(queueName);
  result.should.equal(messageCount);

  // Ensure queue deletion has been correctly delegated to amqplib.
  deleteQueueStub.should.have.been.calledOnce;
  deleteQueueStub.should.have.been.calledWithExactly(queueName, {
    ifUnused: false,
    ifEmpty: false,
  });
});

/**
 * RabbitMQBroker: publishToRoute()
 */
test('RabbitMQBroker.publishToRoute(): Happy path', (t) => {
  // Set variables from the context.
  const { sandbox, channel, broker } = t.context;

  // Define test parameters.
  const routeName = chance.word();
  const message = MessageFactoryHelper.getRandomMessage(true);

  // Stub amqplib's publish().
  // Response example take from the docs.
  // http://www.squaremobius.net/amqp.node/channel_api.html#channel_publish
  const publishStub = sandbox.stub(channel, 'publish').returns(true);

  // Execute the function.
  broker.publishToRoute(routeName, message);

  // Check that the message publishing has been correctly delegated to amqplib.
  publishStub.should.have.been.calledOnce;
  const [exchangeArg, routeArg, bufferArg, optionsArg] = publishStub.firstCall.args;
  exchangeArg.should.be.equal(broker.topicExchange);
  routeArg.should.be.equal(routeName);
  bufferArg.toString().should.be.equal(message.toString());
  optionsArg.should.be.have.property('mandatory', true);
  optionsArg.should.be.have.property('persistent', true);
});

/**
 * RabbitMQBroker: subscribe()
 */
test('RabbitMQBroker.subscribe(): Happy path', async (t) => {
  // Set variables from the context.
  const { sandbox, channel, broker } = t.context;

  // Define test parameters.
  const queueName = chance.word();
  const consumerTag = chance.word();
  const callback = () => true;

  // Stub amqplib's consume().
  // Response example take from the docs.
  // http://www.squaremobius.net/amqp.node/channel_api.html#channel_consume
  const consumeStub = sandbox.stub(channel, 'consume').resolves({
    consumerTag,
  });

  // Execute the function.
  const result = await broker.subscribe(queueName, callback, consumerTag);
  result.should.be.equal(consumerTag);


  // Check that the callback subscription has been correctly delegated to amqplib.
  consumeStub.should.have.been.calledOnce;
  const [queueArg, callbackArg, optionsArg] = consumeStub.firstCall.args;
  queueArg.should.be.equal(queueName);
  callbackArg.should.be.equal(callback);
  callbackArg.should.be.equal(callback);
  optionsArg.should.be.have.property('noAck', false);
  optionsArg.should.be.have.property('exclusive', false);
  optionsArg.should.be.have.property('consumerTag', consumerTag);
});

/**
 * RabbitMQBroker: subscribe()
 */
test('RabbitMQBroker.subscribe(): Callback is executed on new message', async (t) => {
  // Set variables from the context.
  const { sandbox, channel, broker } = t.context;

  // Define test parameters.
  const queueName = chance.word();
  const consumerTag = chance.word();
  const dequeuerSpy = sandbox.spy(rabbitMessage => rabbitMessage);

  // Stub amqplib's consume().
  // @see https://github.com/squaremo/amqp.node/blob/master/lib/callback_model.js#L186
  // Make it register consumer without actually performing RPC to rabbit.
  const consumeStub = sandbox.stub(channel, 'consume').callsFake(async function () {
    // `this` is amqplib's Channel.
    this.registerConsumer(consumerTag, dequeuerSpy);
    return consumerTag;
  });

  // Execute the function.
  await broker.subscribe(queueName, dequeuerSpy);
  consumeStub.should.have.been.calledOnce;

  // Imitate broker senfing a message to the consumer.
  const message = MessageFactoryHelper.getFakeRabbitMessage(false, consumerTag);
  channel.emit('delivery', message);

  // Ensure the callback recieved the message. So cool.
  dequeuerSpy.should.have.been.calledOnce;
  const [messageArg] = dequeuerSpy.firstCall.args;
  messageArg.should.be.deep.equal(message);
});

// ------- End -----------------------------------------------------------------
