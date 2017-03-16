'use strict';

/**
 * Imports.
 */
const test = require('ava');
require('chai').should();
const Queue = require('../../lib/Queue');
const RemoteHttpRequestQ = require('../../queues/RemoteHttpRequestQ');

/**
 * Test RemoteHttpRequestQ class
 */
test('RemoteHttpRequestQ', () => {
  const remoteHttpRequestQ = new RemoteHttpRequestQ();
  remoteHttpRequestQ.should.be.an.instanceof(Queue);
});
