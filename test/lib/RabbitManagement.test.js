'use strict';

/**
 * Imports.
 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const test = require('ava');
const Queue = require('../../lib/Queue');
const Exchange = require('../../lib/Exchange');
const RabbitManagement = require('../../lib/RabbitManagement');

// Chai setup.
chai.should();
chai.use(chaiAsPromised);

/**
 * Test RabbitManagement interface
 */
test('RabbitManagement interface', () => {
  const locals = require('../../config');
  const rabbit = new RabbitManagement(locals.amqpManagement);

  rabbit.should.respondTo('getQueueInfo');
  rabbit.should.respondTo('getQueueBindings');
});

/**
 * Test RabbitManagement::getQueueInfo
 */
test('RabbitManagement::getQueueInfo() fails with non-existent queues', async () => {
  class ShouldFailQ extends Queue {}

  // Local config
  const locals = require('../../config');

  // Real exchange for configuration.
  const tacoX = new Exchange(locals.amqp);
  // Don't setup exchange to test it fail.

  // Fake queue not initialized in Rabbit.
  const shouldFailQ = new ShouldFailQ(tacoX);
  // Don't setup queue to test it fail.

  // Rabbit management.
  const rabbit = new RabbitManagement(locals.amqpManagement);

  // Test request to fail.
  const failedgetQueueInfo = rabbit.getQueueInfo(shouldFailQ);
  await failedgetQueueInfo.should.be.rejectedWith(Error, 'status code 404');
});

