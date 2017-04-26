'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');

const HooksHelper = require('../../helpers/HooksHelper');

// ------- Init ----------------------------------------------------------------

chai.should();
test.beforeEach(HooksHelper.startBlinkWebApp);
test.afterEach(HooksHelper.stopBlinkWebApp);

// ------- Tests ---------------------------------------------------------------

/**
 * GET /api/v1/events
 */
test('GET /api/v1/events should respond with JSON list available tools', async (t) => {
  const res = await t.context.supertest.get('/api/v1/events')
    .auth(t.context.config.app.auth.name, t.context.config.app.auth.password);

  res.status.should.be.equal(200);

  // Check response to be json
  res.header.should.have.property('content-type')
    .and.have.string('application/json');

  // Check response.
  res.body.should.have.property('user-registration')
    .and.have.string('/api/v1/events/user-registration');
});


/**
 * POST /api/v1/events/user-registration
 */
test('POST /api/v1/events/user-registration should validate incoming message', async (t) => {
  // Test empty message
  const responseToEmptyPayload = await t.context.supertest
    .post('/api/v1/events/user-registration')
    .auth(t.context.config.app.auth.name, t.context.config.app.auth.password)
    .send({});
  responseToEmptyPayload.status.should.be.equal(422);
  responseToEmptyPayload.body.should.have.property('ok', false);
  responseToEmptyPayload.body.should.have.property('message')
    .and.have.string('"id" is required');

  // Test incorrect id
  const responseToNotUuid = await t.context.supertest
    .post('/api/v1/events/user-registration')
    .auth(t.context.config.app.auth.name, t.context.config.app.auth.password)
    .send({
      id: 'not-an-uuid',
    });
  responseToNotUuid.status.should.be.equal(422);
  responseToNotUuid.body.should.have.property('ok', false);
  responseToNotUuid.body.should.have.property('message')
    .and.have.string('"id" with value "not-an-uuid" fails to match the valid object id pattern');

  // Test correct payload
  const responseValidPayload = await t.context.supertest
    .post('/api/v1/events/user-registration')
    .auth(t.context.config.app.auth.name, t.context.config.app.auth.password)
    .send({
      id: '5554eac1a59dbf117e8b4567'
    });
  responseValidPayload.status.should.be.equal(200);
  responseValidPayload.body.should.have.property('ok', true);
  responseValidPayload.body.should.have.property('message')
    .and.equal('Message queued');
});
