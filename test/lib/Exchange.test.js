'use strict';

/**
 * Imports.
 */
const test = require('ava');
require('chai').should();
const Exchange = require('../../lib/Exchange');

/**
 * Test RabbitMQ connection
 */
test('RabbitMQ connection', async () => {
  const locals = require('../../config');
  const tacoX = new Exchange(locals.amqp);
  const connected = await tacoX.setup();
  connected.should.be.true;
});
