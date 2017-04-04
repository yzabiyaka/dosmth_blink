'use strict';

/**
 * Imports.
 */
const test = require('ava');
require('chai').should();
const Queue = require('../../lib/Queue');
const CustomerIoWebhookQ = require('../../queues/CustomerIoWebhookQ');

/**
 * Test CustomerIoWebhookQ class
 */
test('CustomerIoWebhookQ', () => {
  const customerIoWebhookQ = new CustomerIoWebhookQ();
  customerIoWebhookQ.should.be.an.instanceof(Queue);
});
