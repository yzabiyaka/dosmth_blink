'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

// ------- Internal imports ----------------------------------------------------

const RabbitMQBroker = require('../../../../../src/lib/brokers/RabbitMQ/RabbitMQBroker');
const MessageFactoryHelper = require('../../../../helpers/MessageFactoryHelper');
const UnitHooksHelper = require('../../../../helpers/UnitHooksHelper');
// const BlinkRetryError = require('../../../src/errors/BlinkRetryError');
// const Dequeuer = require('../../../src/lib/Dequeuer');
// const UnitHooksHelper = require('../../helpers/UnitHooksHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
chai.use(sinonChai);

// Setup blink app for each test.
test.beforeEach(UnitHooksHelper.createFakeAmqpChannel);
test.afterEach.always(UnitHooksHelper.destroyFakeAmqpChannel);

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
  const broker = new RabbitMQBroker({});
  const message = MessageFactoryHelper.getFakeRabbitMessage();
  message.fields.deliveryTag.should.be.not.empty;

  // Stub channel.
  const channel = t.context.amqpChannel;
  const sendImmediatelyStub = sinon.stub(channel, 'sendImmediately').returns(42);
  const ackSpy = sinon.spy(channel, 'ack');

  // Stub broker to work with stubbed channel.
  const brokerChannelStub = sinon.stub(broker, 'getChannel').returns(channel);

  // Perform the ack.
  broker.ack(message);

  // Ack should be called.
  ackSpy.should.have.been.calledOnce;

  // Channel.ack() should pass message delivery tag to sendImmediately().
  sendImmediatelyStub.should.have.been.calledOnce;
  // Arg[0] = operation code, arg[1] = arguments object.
  const deliveryTagCallArgument = sendImmediatelyStub.firstCall.args[1].deliveryTag;
  message.fields.deliveryTag.should.be.equal(deliveryTagCallArgument);

  // Cleanup.
  ackSpy.restore();
  sendImmediatelyStub.restore();
  brokerChannelStub.restore();
});

// ------- End -----------------------------------------------------------------
