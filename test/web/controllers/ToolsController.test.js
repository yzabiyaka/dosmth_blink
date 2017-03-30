'use strict';

/**
 * Imports.
 */
const test = require('ava');
const supertest = require('supertest');
require('chai').should();
const blinkWeb = require('../../../web/blinkWeb');

/**
 * Test /api/v1/tools
 */
test('GET /api/v1/tools should respond with JSON list available tools', async () => {
  const res = await supertest(blinkWeb.callback()).get('/api/v1/tools');
  res.status.should.be.equal(200);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // Check response.
  res.body.should.have.property('fetch');
  res.body.fetch.should.match(/\/api\/v1\/tools\/fetch$/);
});

/**
 * Test /api/v1/tools/fetch
 */
test('GET /api/v1/tools/fetch should validate incoming parameters', async () => {
  // Post with no data.
  const res = await supertest(blinkWeb.callback()).post('/api/v1/tools/fetch');

  res.status.should.be.equal(422);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // Check response.
  res.body.should.have.property('error', 'validation_failed');
  res.body.should.have.property('ok', false);
  res.body.should.have.property('message');
  res.body.should.have.property('hint');
  res.body.should.have.property('fields');
});

/**
 * Test /api/v1/tools/fetch
 */
test('GET /api/v1/tools/fetch should publish message to fetch queue', async () => {
  const res = await supertest(blinkWeb.callback())
    .post('/api/v1/tools/fetch')
    .send({
      url: 'http://localhost/api/v1',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });

  res.status.should.be.equal(200);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // Check response.
  res.body.should.have.property('ok', true);
});
