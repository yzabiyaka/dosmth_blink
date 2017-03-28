'use strict';

/**
 * Imports.
 */
const test = require('ava');
const supertest = require('supertest');
require('chai').should();
const blinkWeb = require('../../../../web/blinkWeb');

/**
 * Test /api/v1.
 */
test('GET /api/v1 should list available endpoints', async () => {
  const res = await supertest(blinkWeb.callback()).get('/api/v1');
  res.status.should.be.equal(200);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // No endpoints to test now.
});
