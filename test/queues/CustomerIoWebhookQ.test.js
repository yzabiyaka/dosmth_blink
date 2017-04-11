'use strict';

/**
 * Imports.
 */
const test = require('ava');
require('chai').should();
const Queue = require('../../src/queues/Queue');
const CustomerIoWebhookQ = require('../../src/queues/CustomerIoWebhookQ');

/**
 * Test CustomerIoWebhookQ class
 */
test('CustomerIoWebhookQ', () => {
  const customerIoWebhookQ = new CustomerIoWebhookQ();
  customerIoWebhookQ.should.be.an.instanceof(Queue);
});
