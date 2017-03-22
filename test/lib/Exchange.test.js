'use strict';

/**
 * Imports.
 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const test = require('ava');
const Exchange = require('../../lib/Exchange');
const Queue = require('../../lib/Queue');


// Chai setup.
chai.should();
chai.use(chaiAsPromised);

/**
 * Exchange class interface
 */
test('Exchange interface', () => {
  const locals = require('../../config');
  const tacoX = new Exchange(locals.amqp);
  tacoX.should.have.respondTo('setup');
  tacoX.should.have.respondTo('assertQueue');
});

/**
 * Exchange::setup() should be able to connect to RabbitMQ
 */
test('Exchange::setup() should be able to connect to RabbitMQ', async () => {
  const locals = require('../../config');
  const tacoX = new Exchange(locals.amqp);
  const connected = await tacoX.setup();
  connected.should.be.true;
});

/**
 * Exchange::setup() should fail with empty exchange name
 */
test('Exchange::setup() should fail with empty exchange name', async () => {
  const locals = require('../../config');

  // Copy RabbitMQ settings, but override exchange with empty string.
  const invalidExchangeSettings = Object.assign({}, locals.amqp, { exchange: '' });

  // Initialize Exchange with incorrect settings.
  const tacoX = new Exchange(invalidExchangeSettings);
  const incorrectSetupResult = tacoX.setup();

  // No exchange name should result in rejection from Exchange::setup() .
  await incorrectSetupResult.should.be.rejectedWith(
    Error,
    'Exchange.setup(): Exchange assertion failed for ""'
  );
});


/**
 * Exchange::assertQueue() should fail with incorrect queueu name
 */
test('Exchange::assertQueue() should fail with empty exchange name', async () => {
  class WrongNameQ extends Queue {}

  const locals = require('../../config');
  const tacoX = new Exchange(locals.amqp);
  await tacoX.setup();

  // Fake queue not initialized in Rabbit.
  const wrongNameQ = new WrongNameQ(tacoX);
  // Override Queue name and watch setup fail.
  // Empty string would result in automatically generated queue name,
  // thus Queue.setup() method will fail.
  wrongNameQ.name = '';

  const incorrectSetupResult = wrongNameQ.setup();
  await incorrectSetupResult.should.be.rejectedWith(
    Error,
    'Exchange.setup(): Queue assertion failed for ""'
  );
});
