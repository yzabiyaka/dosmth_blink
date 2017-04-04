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
test('GET /api/v1/webhooks should respond with JSON list available webhooks', async () => {
  const res = await supertest(blinkWeb.callback()).get('/api/v1/webhooks');
  res.status.should.be.equal(200);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // Check response.
  res.body.should.have.property('customerio');
  res.body.customerio.should.match(/\/api\/v1\/webhooks\/customerio$/);
});

/**
 * Test /api/v1/webhooks/customerio
 */
test('GET /api/v1/webhooks/customerio should publish message to customer-io queue', async () => {
  const data = {
    test: true,
  };

  const res = await supertest(blinkWeb.callback())
    .post('/api/v1/webhooks/customerio')
    .send(data);

  res.status.should.be.equal(200);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // Check response.
  res.body.should.have.property('ok', true);
});
