'use strict';

/**
 * Imports.
 */
const test = require('ava');
require('chai').should();
const Queue = require('../../lib/Queue');

/**
 * Test Queue superclass
 */
test('Queue superclass', () => {
  const queue = new Queue();
  queue.should.respondTo('pub');
  queue.should.respondTo('sub');
  queue.should.respondTo('setup');

  queue.should.have.property('routes');
  queue.routes.should.be.an('array');
});


/**
 * Test that concrete Queue implementation would result in expected queues
 * in RabbitMQ.
 */
test('Test RabbitMQ topology assertion', async () => {
  class TacoFactoryQ extends Queue {

  }

  const tacoFactoryQ = new TacoFactoryQ();
  tacoFactoryQ.should.be.an.instanceof(Queue);

  const connected = await tacoFactoryQ.setup();
  connected.should.be.true;
});
