'use strict';

/**
 * Imports.
 */
const test = require('ava');
const supertest = require('supertest');
require('chai').should();

const blinkWeb = require('../../../web/blinkWeb');
const Exchange = require('../../../lib/Exchange');
const FetchQ = require('../../../queues/FetchQ');
const RabbitManagement = require('../../../lib/RabbitManagement');


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
  // Setup Queue and Exchange
  const config = require('../../../config');
  const testX = new Exchange(config.amqp);
  await testX.setup();
  const fetchQ = new FetchQ(testX);
  await fetchQ.setup();
  await fetchQ.purge();

  const data = {
    url: 'http://localhost/api/v1',
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  };

  const res = await supertest(blinkWeb.callback())
    .post('/api/v1/tools/fetch')
    .send(data);

  res.status.should.be.equal(200);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // Check response.
  res.body.should.have.property('ok', true);


  // Check that the message is queued.
  const rabbit = new RabbitManagement(config.amqpManagement);
  const messages = await rabbit.getMessagesFrom(fetchQ, 2);
  messages.should.be.an('array').and.to.have.lengthOf(1);
  messages[0].should.have.property('payload');
  messages[0].payload.should.be.eql(data);
});
