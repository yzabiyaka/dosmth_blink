'use strict';

/**
 * Imports.
 */
const test = require('ava');
const supertest = require('supertest');
require('chai').should();

const blinkWeb = require('../../../web/blinkWeb');


/**
 * Test /api/v1/webhooks
 */
test('GET /api/v1/webhooks should respond with JSON list available tools', async () => {
  const res = await supertest(blinkWeb.callback()).get('/api/v1/tools');
  res.status.should.be.equal(200);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // Check response.
});
