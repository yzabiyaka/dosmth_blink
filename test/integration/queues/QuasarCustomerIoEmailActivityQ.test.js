'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');

const Queue = require('../../src/lib/Queue');
const QuasarCustomerIoEmailActivityQ = require('../../src/queues/QuasarCustomerIoEmailActivityQ');
const HooksHelper = require('../helpers/HooksHelper');

// ------- Init ----------------------------------------------------------------

chai.should();

// Setup blink app for each test.
test.beforeEach(HooksHelper.startBlinkApp);
test.afterEach.always(HooksHelper.stopBlinkApp);

// ------- Tests ---------------------------------------------------------------

/**
 * Test QuasarCustomerIoEmailActivityQ
 */
test('QuasarCustomerIoEmailActivityQ', (t) => {
  const queue = new QuasarCustomerIoEmailActivityQ(t.context.blink.exchange);
  queue.should.be.an.instanceof(Queue);
  queue.routes.should.include('quasar-customer-io-email-activity');
  queue.routes.should.include('generic-event.quasar');
});

// ------- End -----------------------------------------------------------------
