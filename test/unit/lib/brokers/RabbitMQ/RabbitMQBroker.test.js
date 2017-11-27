'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
// const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const RabbitMQBroker = require('../../../../../src/lib/brokers/RabbitMQ/RabbitMQBroker');
// const BlinkRetryError = require('../../../src/errors/BlinkRetryError');
// const Dequeuer = require('../../../src/lib/Dequeuer');
// const UnitHooksHelper = require('../../helpers/UnitHooksHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
chai.use(sinonChai);

// Setup blink app for each test.
// test.beforeEach(UnitHooksHelper.createRandomQueueInMemory);
// test.afterEach.always(UnitHooksHelper.destroyRandomQueueInMemory);

// ------- Tests ---------------------------------------------------------------

/**
 * Dequeuer: constructor()
 */
test('RabbitMQBroker: Should implement Broker interface', () => {
  const broker = new RabbitMQBroker({});
  broker.should.respondTo('connect');
  broker.should.respondTo('disconnect');
  broker.should.respondTo('publishToRoute');
  broker.should.respondTo('subscribe');
  broker.should.respondTo('ack');
  broker.should.respondTo('nack');
  broker.should.respondTo('createQueue');
  broker.should.respondTo('purgeQueue');
  broker.should.respondTo('deleteQueue');
});

// ------- End -----------------------------------------------------------------
