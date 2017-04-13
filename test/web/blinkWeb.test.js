'use strict';

/**
 * Imports.
 */
const test = require('ava');
require('chai').should();
const supertest = require('supertest');

const blinkWeb = require('../../src/web/blinkWeb');

/**
 * Test GET / with no auth
 */
test('GET / should turn down anonymous requests', async () => {
  const res = await supertest(blinkWeb.callback()).get('/');
  res.status.should.be.equal(401);
  res.text.should.be.have.string('Don\'t blink');
});
