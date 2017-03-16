'use strict';

/**
 * Imports.
 */
const test = require('ava');
require('chai').should();
const Queue = require('../../lib/Queue');

/**
 * Test Queue class
 */
test('Queue methods', () => {
  const queue = new Queue();
  queue.should.respondTo('pub');
  queue.should.respondTo('sub');
  queue.should.have.property('routes');
  queue.routes.should.be.an('array');
});
