'use strict';

/**
 * Imports.
 */
const test = require('ava');
require('chai').should();
const Queue = require('../../src/queues/Queue');
const FetchQ = require('../../src/queues/FetchQ');

/**
 * Test FetchQ class
 */
test('FetchQ', () => {
  const fetchQ = new FetchQ();
  fetchQ.should.be.an.instanceof(Queue);
});
