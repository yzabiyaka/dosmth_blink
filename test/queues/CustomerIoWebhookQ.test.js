'use strict';

/**
 * Imports.
 */
const test = require('ava');
require('chai').should();

const CustomerIoWebhookQ = require('../../src/queues/CustomerIoWebhookQ');
const Queue = require('../../src/queues/Queue');

/**
 * Test CustomerIoWebhookQ class
 */
test('CustomerIoWebhookQ', () => {
  const customerIoWebhookQ = new CustomerIoWebhookQ();
  customerIoWebhookQ.should.be.an.instanceof(Queue);
});
