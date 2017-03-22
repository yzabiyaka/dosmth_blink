'use strict';

/**
 * Imports.
 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const test = require('ava');
const Exchange = require('../../lib/Exchange');
const Queue = require('../../lib/Queue');
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
 * Test RabbitManagement.getQueueInfo
 */
test('RabbitManagement.getQueueInfo() fails with non-existent queues', async () => {
  class NotInitializedQ extends Queue {}

  // Local config
  const locals = require('../../config');

  // Real exchange for configuration.
  const testX = new Exchange(locals.amqp);
  await testX.setup();

  // Fake queue not initialized in Rabbit.
  const notInitializedQ = new NotInitializedQ(testX);
  // Don't setup queue to test info request fail.

  // Rabbit management.
  const rabbit = new RabbitManagement(locals.amqpManagement);

  // Test request to fail.
  const failedgetQueueInfo = rabbit.getQueueInfo(notInitializedQ);
  await failedgetQueueInfo.should.be.rejectedWith(
    Error,
    'Incorrect RabbitManagement.getQueueInfo() response for GET /queues/blink/not-initialized'
  );
});


/**
 * Test RabbitManagement.getQueueBindings
 */
test('RabbitManagement.getQueueBindings() fails with non-existent queues', async () => {
  class NotBoundQ extends Queue {}

  // Local config
  const locals = require('../../config');

  // Real exchange for configuration.
  const testX = new Exchange(locals.amqp);
  await testX.setup();

  // Fake queue not initialized in Rabbit.
  const notBoundQ = new NotBoundQ(testX);
  // Don't setup queue to test binding to fail.

  // Rabbit management.
  const rabbit = new RabbitManagement(locals.amqpManagement);

  // Test request to return 0 bindings.
  const bindings = await rabbit.getQueueBindings(notBoundQ);
  bindings.should.be.an('array').and.have.length(0);
});

