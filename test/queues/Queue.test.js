'use strict';

/**
 * Imports.
 */
const test = require('ava');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const Exchange = require('../../src/lib/Exchange');
const RabbitManagement = require('../../src/lib/RabbitManagement');
const Message = require('../../src/messages/Message');
const Queue = require('../../src/queues/Queue');

// Chai setup.
chai.should();
chai.use(chaiAsPromised);

/**
 * Queue: Test class interface
 */
test('Queue: Test class interface', () => {
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
      this.routes.push('*.taco');
    }
  }

  const locals = require('../../config');
  const testX = new Exchange(locals.amqp);
  await testX.setup();

  const testBindingQ = new TestBindingQ(testX);
  testBindingQ.should.have.property('name');
  testBindingQ.name.should.be.equal('test-binding');
  // Direct + *.taco
  testBindingQ.routes.length.should.equal(2);

  testBindingQ.should.be.an.instanceof(Queue);
  const result = await testBindingQ.setup();
  result.should.be.true;

  // Test queue settings with RabbitMQ Management Plugin API.
  const rabbit = new RabbitManagement(locals.amqpManagement);
  const testBindingQInfo = await rabbit.getQueueInfo(testBindingQ.name);
  testBindingQInfo.should.have.property('name', 'test-binding');
  testBindingQInfo.should.have.property('durable', true);
  testBindingQInfo.should.have.property('auto_delete', false);
  testBindingQInfo.should.have.property('exclusive', false);

  // Test that the queue is binded to the exchange.
  const testBindingQBindings = await rabbit.getQueueBindings(
    testBindingQ.name,
    testBindingQ.exchange.name
  );
  testBindingQBindings.should.be.an('array').and.have.length(2);
  // Specific route
  testBindingQBindings[0].should.have.property('routing_key', '*.taco');
  testBindingQBindings[0].should.have.property('source', 'test-x');
  testBindingQBindings[0].should.have.property('destination', 'test-binding');
  // Direct route
  testBindingQBindings[1].should.have.property('routing_key', 'test-binding');
  testBindingQBindings[1].should.have.property('source', 'test-x');
  testBindingQBindings[1].should.have.property('destination', 'test-binding');
});

/**
 * Queue.publish(), Queue.purge(): Test direct publishing and purging
 */
test('Queue.publish(), Queue.purge(): Test direct publishing and purging', async () => {
  class TestDirectPublishQ extends Queue {}

  const locals = require('../../config');
  const testX = new Exchange(locals.amqp);
  await testX.setup();

  const testDirectPublishQ = new TestDirectPublishQ(testX);
  await testDirectPublishQ.setup();

  // Purge queue in case it already exists.
  await testDirectPublishQ.purge();

  // Publish test message to the queue.
  const testMessage = new Message({ passed: true });
  const publishResult = testDirectPublishQ.publish(testMessage);
  publishResult.should.be.true;

  // Check message count with Queue purge.
  const purgeResult = await testDirectPublishQ.purge();
  purgeResult.should.equal(1);
});

/**
 * Queue.purge(): Ensure incorrect queue purging fails
 */
test('Queue.purge(): Ensure incorrect queue purging fails', async () => {
  class TestIncorrectPurgeQ extends Queue {}

  const locals = require('../../config');
  const testX = new Exchange(locals.amqp);
  await testX.setup();

  const testIncorrectPurgeQ = new TestIncorrectPurgeQ(testX);
  // Don't setup queue to make sure Queue.purge() fails.

  // Purge queue in case it already exists.
  const purgeResult = testIncorrectPurgeQ.purge();
  await purgeResult.should.be.rejectedWith(
    Error,
    'Queue.purge(): failed to purge queue "test-incorrect-purge"'
  );
});
