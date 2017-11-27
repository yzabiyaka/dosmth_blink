'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const sinonChai = require('sinon-chai');

// ------- Internal imports ----------------------------------------------------

const RabbitMQBroker = require('../../../../../src/lib/brokers/RabbitMQ/RabbitMQBroker');
const MessageFactoryHelper = require('../../../../helpers/MessageFactoryHelper');
const UnitHooksHelper = require('../../../../helpers/UnitHooksHelper');

// ------- Init ----------------------------------------------------------------

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
  // Acknowledge fake message.
  broker.ack(message);

  // Ack should be called.
  ackSpy.should.have.been.calledOnce;

  // Channel.ack() should pass message delivery tag to sendImmediately().
  sendImmediatelyStub.should.have.been.calledOnce;
  // Arg[0] = operation code, arg[1] = arguments object.
  const deliveryTagCallArgument = sendImmediatelyStub.firstCall.args[1].deliveryTag;
  // Ensure channel.ack() passed message's deliveryTag to sendImmediately().
  message.fields.deliveryTag.should.be.equal(deliveryTagCallArgument);
});

// ------- End -----------------------------------------------------------------
