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
test('RabbitManagement: Test class interface', () => {
  const locals = require('../../config');
  const rabbit = new RabbitManagement(locals.amqpManagement);

  rabbit.should.respondTo('getQueueInfo');
  rabbit.should.respondTo('getQueueBindings');
});

/**
 * RabbitManagement.getQueueInfo(): Test Queue not found response
 */
test('RabbitManagement.getQueueInfo(): Test Queue not found response', async () => {
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
  const failedGetQueueInfo = rabbit.getQueueInfo(notInitializedQ);
  await failedGetQueueInfo.should.be.rejectedWith(
    Error,
    'Incorrect RabbitManagement.getQueueInfo() response for GET /queues/blink/not-initialized'
  );
});


/**
 * RabbitManagement.getQueueBindings(): Test response for not bound queues
 */
test('RabbitManagement.getQueueBindings(): Test response for not bound queues', async () => {
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
  const failedGetQueueBindings =  rabbit.getQueueBindings(notBoundQ);
  await failedGetQueueBindings.should.be.rejectedWith(
    Error,
    'Incorrect RabbitManagement.getQueueBindings() response for GET /bindings/blink/e/test-x/q/not-bound'
  );
});

