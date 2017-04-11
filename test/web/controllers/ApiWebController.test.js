'use strict';

/**
 * Imports.
 */
const test = require('ava');
const supertest = require('supertest');
require('chai').should();
const blinkWeb = require('../../../src/web/blinkWeb');

/**
 * Test /api.
 */
test('GET /api should respond with JSON list of API versions', async () => {
  const config = require('../../../config');
  const res = await supertest(blinkWeb.callback())
    .get('/api')
    .auth(config.app.auth.name, config.app.auth.password);
  res.status.should.be.equal(200);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // Check response to include /api/v1
  res.body.should.have.property('v1');
  res.body.v1.should.match(/\/api\/v1$/);
});

/**
 * Test /api/v1.
 */
test('GET /api/v1 should list available endpoints', async () => {
  const config = require('../../../config');
  const res = await supertest(blinkWeb.callback())
    .get('/api/v1')
    .auth(config.app.auth.name, config.app.auth.password);
  res.status.should.be.equal(200);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // Check response to inclue expected endpoints
  res.body.should.have.property('tools');
  res.body.tools.should.match(/\/api\/v1\/tools$/);
  res.body.should.have.property('webhooks');
  res.body.webhooks.should.match(/\/api\/v1\/webhooks$/);
});
