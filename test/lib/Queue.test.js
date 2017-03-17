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
  queue.should.respondTo('sub');
  queue.should.respondTo('setup');

  queue.should.have.property('routes');
  queue.routes.should.be.an('array').and.have.length.at.least(1);
});


/**
 * Test that concrete Queue implementation would result in expected queues
 * in RabbitMQ.
 */
test('Test RabbitMQ topology assertion', async () => {
  class TacoFactoryQ extends Queue {}

  const locals = require('../../config');
  const tacoX = new Exchange(locals.amqp);
  await tacoX.setup();

  const tacoFactoryQ = new TacoFactoryQ(tacoX);
  tacoFactoryQ.should.have.property('name');
  tacoFactoryQ.name.should.be.equal('taco-factory');

  tacoFactoryQ.should.be.an.instanceof(Queue);
  const result = await tacoFactoryQ.setup();
  result.should.be.true;

  // Test queue settings with RabbitMQ Management Plugin API.
  const rabbit = new RabbitManagement(locals.amqpManagement);
  const tacoFactoryInfo = await rabbit.getQueueInfo(tacoFactoryQ);
  tacoFactoryInfo.should.have.property('name', 'taco-factory');
  tacoFactoryInfo.should.have.property('durable', true);
  tacoFactoryInfo.should.have.property('auto_delete', false);
  tacoFactoryInfo.should.have.property('exclusive', false);
});
