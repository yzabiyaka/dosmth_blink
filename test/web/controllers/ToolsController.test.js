'use strict';

/**
 * Imports.
 */
const test = require('ava');
const supertest = require('supertest');
require('chai').should();

const blinkWeb = require('../../../web/blinkWeb');
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
  const res = await supertest(blinkWeb.callback())
    .post('/api/v1/tools/fetch')
    .send({
      // Send no url param and incorrect options param.
      options: 42,
    });

  res.status.should.be.equal(422);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // Check response.
  res.body.should.have.property('error', 'validation_failed');
  res.body.should.have.property('ok', false);
  res.body.should.have.property('message').and.to.have.string('"url" is required');
});

/**
 * Test /api/v1/tools/fetch
 */
test('GET /api/v1/tools/fetch should publish message to fetch queue', async () => {
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
  const config = require('../../../config');
  const rabbit = new RabbitManagement(config.amqpManagement);
  const messages = await rabbit.getMessagesFrom('fetch', 1);
  messages.should.be.an('array').and.to.have.lengthOf(1);

  messages[0].should.have.property('payload');
  const payload = messages[0].payload;
  const messageData = JSON.parse(payload);
  messageData.should.have.property('data');
  messageData.data.should.be.eql(data);
});
