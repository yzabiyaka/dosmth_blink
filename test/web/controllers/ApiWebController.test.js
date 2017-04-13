'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');
const supertest = require('supertest');

const config = require('../../../config');
const BlinkWebApp = require('../../../src/app/BlinkWebApp.js');

// ------- Init ----------------------------------------------------------------

chai.should();

test.beforeEach(async (t) => {
  t.context.blink = new BlinkWebApp(config);
  await t.context.blink.start();
  t.context.supertest = supertest(t.context.blink.web.app.callback());
});

test.afterEach(async (t) => {
  await t.context.blink.stop();
  t.context.supertest = false;
});

// ------- Tests ---------------------------------------------------------------

/**
 * Test GET /.
 */
test('GET / should be polite', async (t) => {
  const res = await t.context.supertest.get('/')
    .auth(config.app.auth.name, config.app.auth.password);

  res.status.should.be.equal(200);
  res.text.should.be.equal('Hi, I\'m Blink!');
});

/**
 * Test /api.
 */
test('GET /api should respond with JSON list of API versions', async (t) => {
  const res = await t.context.supertest.get('/api')
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
test('GET /api/v1 should list available endpoints', async (t) => {
  const res = await t.context.supertest.get('/api/v1')
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

// ------- End -----------------------------------------------------------------
