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
 * Test Queue interface
 */
test('Queue interface', () => {
  const queue = new Queue();
  queue.should.respondTo('setup');
  queue.should.respondTo('publish');
  queue.should.respondTo('purge');

  queue.should.have.property('routes');
  queue.routes.should.be.an('array').and.have.length.at.least(1);
});


/**
 * Test that concrete Queue implementation would result in expected queues
 * in RabbitMQ.
 */
test('Queue.setup(): Test RabbitMQ topology assertion', async () => {
  class TestBindingQ extends Queue {
    constructor(exchange) {
      super(exchange);
      this.routes.push('*.mexican.food');
    }
  }

  const locals = require('../../config');
  const tacoX = new Exchange(locals.amqp);
  await tacoX.setup();

  const testBindingQ = new TestBindingQ(tacoX);
  testBindingQ.should.have.property('name');
  testBindingQ.name.should.be.equal('test-binding');
  // Direct + *.mexican.food
  testBindingQ.routes.length.should.equal(2);

  testBindingQ.should.be.an.instanceof(Queue);
  const result = await testBindingQ.setup();
  result.should.be.true;

  // Test queue settings with RabbitMQ Management Plugin API.
  const rabbit = new RabbitManagement(locals.amqpManagement);
  const testBindingQInfo = await rabbit.getQueueInfo(testBindingQ);
  testBindingQInfo.should.have.property('name', 'test-binding');
  testBindingQInfo.should.have.property('durable', true);
  testBindingQInfo.should.have.property('auto_delete', false);
  testBindingQInfo.should.have.property('exclusive', false);

  // Test that the queue is binded to the exchange.
  const testBindingQBindings = await rabbit.getQueueBindings(testBindingQ);
  testBindingQBindings.should.be.an('array').and.have.length(2);
  // Specific route
  testBindingQBindings[0].should.have.property('routing_key', '*.mexican.food');
  testBindingQBindings[0].should.have.property('source', tacoX.name);
  testBindingQBindings[0].should.have.property('destination', 'test-binding');
  // Direct route
  testBindingQBindings[1].should.have.property('routing_key', 'test-binding');
  testBindingQBindings[1].should.have.property('source', tacoX.name);
  testBindingQBindings[1].should.have.property('destination', 'test-binding');
});

/**
 * Test Queue direct publishing
 */
test('Queue.publish(), Queue.purge(): Test direct publishing and purging', async () => {
  class TestDirectPublishQ extends Queue {}

  const locals = require('../../config');
  const tacoX = new Exchange(locals.amqp);
  await tacoX.setup();

  const testDirectPublishQ = new TestDirectPublishQ(tacoX);
  await testDirectPublishQ.setup();

  // Purge queue in case it already exists.
  await testDirectPublishQ.purge();

  // Publish test message to the queue.
  const testPayload = { passed: true };
  const publishResult = await testDirectPublishQ.publish(testPayload);
  publishResult.should.be.true;

  // Check message count with Queue purge.
  const purgeResult = await testDirectPublishQ.purge();
  purgeResult.should.equal(1);
});

/**
 * Test purge method to fail
 */
test('Queue.purge(): Ensure incorrect queue purging fails', async () => {
  class TestIncorrectPurgeQ extends Queue {}

  const locals = require('../../config');
  const tacoX = new Exchange(locals.amqp);
  await tacoX.setup();

  const testIncorrectPurgeQ = new TestIncorrectPurgeQ(tacoX);
  // Don't setup queue to make sure Queue.purge() fails.

  // Purge queue in case it already exists.
  const purgeResult = testIncorrectPurgeQ.purge();
  await purgeResult.should.be.rejectedWith(
    Error,
    'Queue.purge(): failed to purge queue "test-incorrect-purge"'
  );
});
