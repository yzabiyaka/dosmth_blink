'use strict';

/**
 * Imports.
 */
const test = require('ava');
require('chai').should();
const Queue = require('../../lib/Queue');
const FetchQ = require('../../queues/FetchQ');

/**
 * Test FetchQ class
 */
test('FetchQ', () => {
  const fetchQ = new FetchQ();
  fetchQ.should.be.an.instanceof(Queue);
});
