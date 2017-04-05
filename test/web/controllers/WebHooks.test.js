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
    data: {
      campaign_id: '0',
      customer_id: 'example_customer',
      email_address: 'example@customer.io',
      email_id: 'example_email',
      subject: 'Example Email',
      template_id: '0',
    },
    event_id: 'abc123',
    event_type: 'example_webhook',
    timestamp: 1491337360,
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

  // Check that the message is queued.
  const config = require('../../../config');
  const rabbit = new RabbitManagement(config.amqpManagement);
  // TODO: queue cleanup to make sure that it's not OLD message.
  const messages = await rabbit.getMessagesFrom('customer-io-webhook', 1);
  messages.should.be.an('array').and.to.have.lengthOf(1);

  messages[0].should.have.property('payload');
  const payload = messages[0].payload;
  const messageData = JSON.parse(payload);
  messageData.should.have.property('data');
  messageData.data.should.be.eql(data);
});
