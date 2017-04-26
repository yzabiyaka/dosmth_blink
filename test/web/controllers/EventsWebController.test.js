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
