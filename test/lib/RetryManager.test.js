'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
// const sinon = require('sinon');
// const sinonChai = require('sinon-chai');

// const BlinkRetryError = require('../../src/errors/BlinkRetryError');
const RetryManager = require('../../src/lib/RetryManager');
// const FreeFormMessage = require('../../src/messages/FreeFormMessage');
// const HooksHelper = require('../helpers/HooksHelper');
// const MessageFactoryHelper = require('../helpers/MessageFactoryHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
// chai.use(sinonChai);

// Setup blink app for each test.
// test.beforeEach(HooksHelper.createRandomQueue);
// test.afterEach.always(HooksHelper.destroyRandomQueue);

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
});
