'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
// const chaiAsPromised = require('chai-as-promised');

const Dequeuer = require('../../src/lib/Dequeuer');
// const Queue = require('../../src/lib/Queue');
// const RabbitManagement = require('../../src/lib/RabbitManagement');
// const Message = require('../../src/messages/Message');
const HooksHelper = require('../helpers/HooksHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
// chai.use(chaiAsPromised);

// Setup blink app for each test.
test.beforeEach(HooksHelper.createRandomQueue);
test.afterEach.always(HooksHelper.destroyRandomQueue);

// ------- Tests ---------------------------------------------------------------

/**
 * Dequeuer: Test class interface
 */
test('Dequeuer: Test class interface', (t) => {
  const dequeuer = new Dequeuer(t.context.Queue);
  dequeuer.should.respondTo('dequeue');
  dequeuer.should.respondTo('executeCallback');
  dequeuer.should.respondTo('processCallbackResult');
  dequeuer.should.respondTo('processCallbackError');
  dequeuer.should.respondTo('extractOrDiscard');
  dequeuer.should.respondTo('unpack');
  dequeuer.should.respondTo('validate');
  dequeuer.should.respondTo('log');
});

// ------- End -----------------------------------------------------------------
