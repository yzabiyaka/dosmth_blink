'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const Dequeuer = require('../../src/lib/Dequeuer');
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
  // Override queue method to ensure ack() will be called;
  const queue = t.context.queue;
  const ackSpy = sinon.spy();
  queue.ack = ackSpy;

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
  ackSpy.should.have.been.calledWith(message);
});

/**
 * Dequeuer: executeCallback()
 */
test('Dequeuer: executeCallback() should nack when unexpected error is thrown from callback', async (t) => {
  // Override queue method to ensure ack() will be called;
  const queue = t.context.queue;
  const nackSpy = sinon.spy();
  queue.nack = nackSpy;

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

  // Make sure the message has been acknowledged.
  nackSpy.should.have.been.calledWith(message);
});

// ------- End -----------------------------------------------------------------
