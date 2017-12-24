'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const BlinkApp = require('../../../src/app/BlinkApp');
const Queue = require('../../../src/lib/Queue');
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
  class RetryTestQ extends Queue {}
  const retryTestQ = new RetryTestQ(blink.broker);
  await retryTestQ.create();
  const registryName = BlinkApp.generateQueueRegistryKey(RetryTestQ);
  blink.queues[registryName] = retryTestQ;

  // Publish message to it.
  const message = MessageFactoryHelper.getRandomMessage(true);
  retryTestQ.publish(message);

  // Create a worker app to consume this message from the queue.
  class RetryTestWorker extends Worker {
    constructor() {
      super(blink);
      this.consume = this.consume.bind(this);
    }
    /* eslint-disable no-unused-vars, class-methods-use-this, no-empty-function */
    setup() {}
    async consume() {}
    /* eslint-enable */
  }

  // Start the worker
  const worker = new RetryTestWorker(blink);
  const consumeStub = sinon.spy(worker, 'consume');
  consumeStub.onCall(0).callsFake((arg) => {
    console.dir(arg, { colors: true, showHidden: true });
  });

  worker.setup();
  worker.start();

  // Wait and execute.
  await new Promise(resolve => setTimeout(resolve, 500));
  consumeStub.should.have.been.calledOnce;
});


// ------- End -----------------------------------------------------------------
