'use strict';

/**
 * Imports.
 */
const test = require('ava');
require('chai').should();
const Queue = require('../../lib/Queue');
const Exchange = require('../../lib/Exchange');
const RabbitManagement = require('../../lib/RabbitManagement');

/**
 * Test Queue superclass
 */
test('Queue superclass', () => {
  const queue = new Queue();
  queue.should.respondTo('pub');
  queue.should.respondTo('setup');

  queue.should.have.property('routes');
  queue.routes.should.be.an('array').and.have.length.at.least(1);
});


/**
 * Test that concrete Queue implementation would result in expected queues
 * in RabbitMQ.
 */
test('Test RabbitMQ topology assertion', async () => {
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
