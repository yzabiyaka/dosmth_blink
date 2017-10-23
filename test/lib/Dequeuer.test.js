'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const Dequeuer = require('../../src/lib/Dequeuer');
const FreeFormMessage = require('../../src/messages/FreeFormMessage');
const HooksHelper = require('../helpers/HooksHelper');
const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
chai.use(sinonChai);

// Setup blink app for each test.
test.beforeEach(HooksHelper.createRandomQueue);
test.afterEach.always(HooksHelper.destroyRandomQueue);

// ------- Tests ---------------------------------------------------------------

/**
 * Dequeuer: Test class interface
 */
test('Dequeuer: Test class interface', (t) => {
  const dequeuer = new Dequeuer(t.context.queue);
  dequeuer.should.respondTo('dequeue');
  dequeuer.should.respondTo('executeCallback');
  dequeuer.should.respondTo('processCallbackResult');
  dequeuer.should.respondTo('processCallbackError');
  dequeuer.should.respondTo('extractOrDiscard');
  dequeuer.should.respondTo('unpack');
  dequeuer.should.respondTo('validate');
  dequeuer.should.respondTo('log');
});

/**
 * Dequeuer: executeCallback()
 */
test('Dequeuer: executeCallback() should ack successfully processed message', async (t) => {
  const queue = t.context.queue;
  // Override queue method to ensure ack() will be called.
  const ackStub = sinon.stub(queue, 'ack').returns(null);

  // Create dequeue callback and spu on it.
  const callback = async () => true;
  const callbackSpy = sinon.spy(callback);

  // Prepare random message to make dequeur think it fot it from Rabbit.
  const message = MessageFactoryHelper.getRandomMessage();

  // Dequeue test message.
  const dequeuer = new Dequeuer(queue, callbackSpy);
  const result = await dequeuer.executeCallback(message);
  result.should.be.true;

  // Ensure callback has been called.
  callbackSpy.should.have.been.calledOnce;

  // Make sure the message has been acknowledged.
  ackStub.should.have.been.calledWith(message);

  // Cleanup.
  ackStub.restore();
});

/**
 * Dequeuer: executeCallback()
 */
test('Dequeuer: executeCallback() ensure that expectedly not processed message is still acked', async (t) => {
  const queue = t.context.queue;
  // Override queue method to ensure ack() will be called.
  const ackStub = sinon.stub(queue, 'ack').returns(null);

  // Create dequeue callback and spu on it.
  const callback = async () => false;
  const callbackSpy = sinon.spy(callback);

  // Prepare random message to make dequeur think it fot it from Rabbit.
  const message = MessageFactoryHelper.getRandomMessage();

  // Dequeue test message.
  const dequeuer = new Dequeuer(queue, callbackSpy);
  const result = await dequeuer.executeCallback(message);
  result.should.be.true;

  // Ensure callback has been called.
  callbackSpy.should.have.been.calledOnce;

  // Make sure the message has been acknowledged.
  ackStub.should.have.been.calledWith(message);

  // Cleanup.
  ackStub.restore();
});

/**
 * Dequeuer: executeCallback()
 */
test('Dequeuer: executeCallback() should nack when unexpected error is thrown from callback', async (t) => {
  const queue = t.context.queue;
  // Override queue method to ensure nack() will be called.
  const nackStub = sinon.stub(queue, 'nack').returns(null);

  // Create dequeue callback and spu on it.
  const callback = async () => {
    throw new Error('Testing unexpected exception from worker callback');
  };
  const callbackSpy = sinon.spy(callback);

  // Prepare random message to make dequeur think it fot it from Rabbit.
  const message = MessageFactoryHelper.getRandomMessage();

  // Dequeue test message.
  const dequeuer = new Dequeuer(queue, callbackSpy);
  const result = await dequeuer.executeCallback(message);
  result.should.be.false;

  // Ensure callback has been called.
  callbackSpy.should.have.been.calledOnce;

  // Ensure the message has been nacked.
  nackStub.should.have.been.calledWith(message);

  // Cleanup.
  nackStub.restore();
});

/**
 * Dequeuer: extractOrDiscard() incorrect json.
 */
test('Dequeuer: extractOrDiscard() should nack message with incorrect JSON payload', (t) => {
  const queue = t.context.queue;
  // Override queue method to ensure nack() will be called.
  const nackStub = sinon.stub(queue, 'nack').returns(null);

  // Ensure Message.fromRabbitMessage throws MessageParsingBlinkError
  const blinkParsingErrorSpy = sinon.spy(queue.messageClass, 'parseIncomingPayload');

  // Create deliberaly incorrect JSON and feed it to extractOrDiscard.
  const rabbitMessage = MessageFactoryHelper.getFakeRabbitMessage('{incorrect-json}');
  const dequeuer = new Dequeuer(queue);
  const result = dequeuer.extractOrDiscard(rabbitMessage);
  result.should.be.false;

  // Ensure the message been nacked.
  nackStub.should.have.been.calledOnce;

  // Ensure MessageParsingBlinkError has been thrown.
  blinkParsingErrorSpy.should.have.thrown('MessageParsingBlinkError');

  // Cleanup.
  nackStub.restore();
  blinkParsingErrorSpy.restore();
});

/**
 * Dequeuer: extractOrDiscard() unknown error.
 */
test('Dequeuer: extractOrDiscard() should nack message on unknown unpack error', (t) => {
  const queue = t.context.queue;
  // Override queue method to ensure nack() will be called.
  const nackStub = sinon.stub(queue, 'nack').returns(null);

  // Simulate unknown error in Message.fromRabbitMessage().
  // This method is static so we can stub it on Message constructor itself.
  const fromRabbitMessageStub = sinon.stub(queue.messageClass, 'fromRabbitMessage');
  fromRabbitMessageStub.throws(() => {
    // Fake unexpected error thrown from Message.fromRabbitMessage().
    const error = new Error('Testing unexpected exception from Message.fromRabbitMessage()');
    return error;
  });

  // Create random valid message.
  // It will be successfully unpacked from JSON,  but discarded anyways
  //  because we've overridden Message.fromRabbitMessage().
  const message = MessageFactoryHelper.getRandomMessage();
  const rabbitMessage = MessageFactoryHelper.getFakeRabbitMessage(message.toString());

  const dequeuer = new Dequeuer(queue);
  const result = dequeuer.extractOrDiscard(rabbitMessage);
  result.should.be.false;

  // Ensure the message been nacked.
  nackStub.should.have.been.calledOnce;

  // Cleanup.
  nackStub.restore();
  fromRabbitMessageStub.restore();
});

/**
 * Dequeuer: extractOrDiscard() nack invalid message.
 */
test('Dequeuer: extractOrDiscard() should nack invalid message', (t) => {
  const queue = t.context.queue;
  // Override queue method to ensure nack() will be called.
  const nackStub = sinon.stub(queue, 'nack').returns(null);

  // Create invalid message (data expected to be an object)
  // and ensure it has been rejected with MessageValidationBlinkError.
  const invalidMessage = new FreeFormMessage({
    data: [],
    meta: {},
  });
  const validateSpy = sinon.spy(invalidMessage, 'validate');

  // Feed invalid message to Dequeuer.
  const rabbitMessage = MessageFactoryHelper.getFakeRabbitMessage(invalidMessage.toString());
  const dequeuer = new Dequeuer(queue);

  // Stub Dequeuer.unpack() to make it return message we actually spy on.
  const unpackStub = sinon.stub(dequeuer, 'unpack');
  unpackStub.callsFake(() => invalidMessage);

  const result = dequeuer.extractOrDiscard(rabbitMessage);
  result.should.be.false;

  // Ensure the message been nacked.
  nackStub.should.have.been.calledOnce;

  // Ensure MessageValidationBlinkError has been thrown.
  validateSpy.should.have.thrown('MessageValidationBlinkError');

  // Cleanup.
  nackStub.restore();
  validateSpy.restore();
  unpackStub.restore();
});

// ------- End -----------------------------------------------------------------
