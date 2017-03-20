'use strict';

/**
 * Imports.
 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const test = require('ava');
const Exchange = require('../../lib/Exchange');

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
  try {
    const incorrectSetupResult = await tacoX.setup();
  } catch (error) {
    console.log(1);
    console.log(error);
  }

  // await incorrectSetupResult.should.be.rejectedWith(
  //   Error,
  //   'Incorrect Exchange::setup() for Exchange ""'
  // );



  // No exchange name should result in an error.
});
