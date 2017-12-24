'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const BlinkApp = require('../../../src/app/BlinkApp');
const BlinkRetryError = require('../../../src/errors/BlinkRetryError');
const Queue = require('../../../src/lib/Queue');
const FreeFormMessage = require('../../../src/messages/FreeFormMessage');
const Worker = require('../../../src/workers/Worker');
const HooksHelper = require('../../helpers/HooksHelper');
const MessageFactoryHelper = require('../../helpers/MessageFactoryHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
chai.use(sinonChai);

// const chance = new Chance();

// ------- Tests ---------------------------------------------------------------

test.serial('RedisRetriesRepublishTimerTask Test full message cycle. ', async (t) => {
  await HooksHelper.startBlinkWebApp(t);
  const blink = t.context.blink;

  // Create test queue and register it in Blink app.
  class RetryTestQ extends Queue {
    constructor(...args) {
      super(...args);
      this.messageClass = FreeFormMessage;
    }
  }
  const retryTestQ = new RetryTestQ(blink.broker);
  const ackSpy = sinon.spy(retryTestQ, 'ack');
  await retryTestQ.create();
  const registryName = BlinkApp.generateQueueRegistryKey(RetryTestQ);
  blink.queues[registryName] = retryTestQ;

  // Purge the queue in case it existed.
  await retryTestQ.purge();

  // 1. Publish message to the queue -------------------------------------------
  const message = MessageFactoryHelper.getRandomMessage(true);
  retryTestQ.publish(message);

  // Create a worker app to consume this message from the queue.
  class RetryTestWorker extends Worker {
    /* eslint-disable no-unused-vars, class-methods-use-this, no-empty-function */
    setup() {
      super.setup(this.blink.queues.retryTestQ);
    }
    async consume() {}
    /* eslint-enable */
  }

  // 2. Start the worker and send the message for a retry ----------------------
  const worker = new RetryTestWorker(blink);
  const consumeStub = sinon.stub(worker, 'consume');
  // First call should send the message to retries.
  consumeStub.onCall(0).callsFake((incomingMessage) => {
    throw new BlinkRetryError('Testing retries', incomingMessage);
  });

  // Setup worker, including dealing infrastructure.
  worker.setup();
  // Spy on the delay infrastructure API call.
  // const delayMessageRetrySpy = sinon.spy(worker.retryDelayer, 'delayMessageRetry');
  // Start consuming messages from the queue.
  worker.start();

  // 3. Ensure message has been sent to redis and removed from the queue -------
  // Wait to ensure it worked.
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Consume callback should have been called.
  consumeStub.should.have.been.calledOnce;
  // Delay message retry should have been called.
  // delayMessageRetrySpy.should.have.been.calledOnce;

  // Messages should have been remvoed from the original queue.
  ackSpy.should.have.been.calledOnce;
  const [ackFirstCallMessageArg] = ackSpy.firstCall.args;
  // Ensure it's the same message.
  ackFirstCallMessageArg.getData().should.eql(message.getData());
  // 4. Start the timer to get the message back the queue ----------------------
});


// ------- End -----------------------------------------------------------------
