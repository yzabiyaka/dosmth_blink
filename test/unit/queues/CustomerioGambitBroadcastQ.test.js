'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');

const Broker = require('../../../src/lib/brokers/Broker');
const Queue = require('../../../src/lib/Queue');
const CustomerIoGambitBroadcastQ = require('../../../src/queues/CustomerIoGambitBroadcastQ');

// ------- Init ----------------------------------------------------------------

chai.should();

// ------- Tests ---------------------------------------------------------------

/**
 * Test CustomerIoGambitBroadcastQ
 */
test('CustomerIoGambitBroadcastQ', () => {
  const queue = new CustomerIoGambitBroadcastQ(new Broker());
  queue.should.be.an.instanceof(Queue);
  queue.routes.should.include('customer-io-gambit-broadcast');
});

// ------- End -----------------------------------------------------------------
