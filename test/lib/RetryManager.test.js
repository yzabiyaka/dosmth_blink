'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
// const sinon = require('sinon');
// const sinonChai = require('sinon-chai');

// const BlinkRetryError = require('../../src/errors/BlinkRetryError');
const RetryManager = require('../../src/lib/RetryManager');
const DelayLogic = require('../../src/lib/DelayLogic');
// const FreeFormMessage = require('../../src/messages/FreeFormMessage');
const HooksHelper = require('../helpers/HooksHelper');
// const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
// chai.use(sinonChai);

// Setup blink app for each test.
test.beforeEach(HooksHelper.createRandomQueueInMemory);
test.afterEach.always(HooksHelper.destroyRandomQueueInMemory);

// ------- Tests ---------------------------------------------------------------

/**
 * RetryManager: constructor()
 */
test('RetryManager: Test class interface', (t) => {
  const retryManager = new RetryManager(t.context.queue);
  retryManager.should.respondTo('retry');
  retryManager.should.respondTo('retryDelay');
  retryManager.should.respondTo('scheduleRedeliveryIn');
  retryManager.should.respondTo('redeliver');
  retryManager.should.respondTo('log');
  retryManager.should.have.property('retryLimit');
  // Ensure default retry delay logic is DelayLogic.exponentialBackoff
  retryManager.retryDelay.should.be.equal(DelayLogic.exponentialBackoff);

  // Ensure it's possible to override DelayLogic
  const customDelayLogic = currentRetryNumber => currentRetryNumber;
  const retryManagerCustom = new RetryManager(t.context.queue, customDelayLogic);
  retryManagerCustom.should.respondTo('retryDelay');
  retryManagerCustom.retryDelay.should.be.equal(customDelayLogic);
});
