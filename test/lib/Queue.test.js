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
  class TacoRecipesQ extends Queue {
    constructor(exchange) {
      super(exchange);
      this.routes.push('*.mexican.food');
    }
  }

  const locals = require('../../config');
  const tacoX = new Exchange(locals.amqp);
  await tacoX.setup();

  const tacoRecipesQ = new TacoRecipesQ(tacoX);
  tacoRecipesQ.should.have.property('name');
  tacoRecipesQ.name.should.be.equal('taco-recipes');
  // Direct + *.mexican.food
  tacoRecipesQ.routes.length.should.equal(2);

  tacoRecipesQ.should.be.an.instanceof(Queue);
  const result = await tacoRecipesQ.setup();
  result.should.be.true;

  // Test queue settings with RabbitMQ Management Plugin API.
  const rabbit = new RabbitManagement(locals.amqpManagement);
  const tacoRecipesQInfo = await rabbit.getQueueInfo(tacoRecipesQ);
  tacoRecipesQInfo.should.have.property('name', 'taco-recipes');
  tacoRecipesQInfo.should.have.property('durable', true);
  tacoRecipesQInfo.should.have.property('auto_delete', false);
  tacoRecipesQInfo.should.have.property('exclusive', false);

  // Test that the queue is binded to the exchange.
  const tacoRecipesQBindings = await rabbit.getQueueBindings(tacoRecipesQ);
  tacoRecipesQBindings.should.be.an('array').and.have.length(2);
  // Specific route
  tacoRecipesQBindings[0].should.have.property('routing_key', '*.mexican.food');
  tacoRecipesQBindings[0].should.have.property('source', tacoX.name);
  tacoRecipesQBindings[0].should.have.property('destination', 'taco-recipes');
  // Direct route
  tacoRecipesQBindings[1].should.have.property('routing_key', 'taco-recipes');
  tacoRecipesQBindings[1].should.have.property('source', tacoX.name);
  tacoRecipesQBindings[1].should.have.property('destination', 'taco-recipes');
});
