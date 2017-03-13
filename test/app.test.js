'use strict';

/**
 * Imports.
 */
const test = require('ava');
const supertest = require('supertest');
require('chai').should();
const app = require('../app');

/**
 * Test root.
 */
test('GET / should be polite', async () => {
  const res = await supertest(app).get('/');
  res.status.should.be.equal(200);
  res.text.should.be.equal('Hi, I\'m Blink!');
});

/**
 * Test api root.
 */
test('GET /api should respond with JSON list of API versions', async () => {
  const res = await supertest(app).get('/api');
  res.status.should.be.equal(200);

  // Check response to be json
  res.header.should.have.property('content-type');
  res.header['content-type'].should.match(/json/);

  // Check response to include /api/v1
  res.body.should.have.property('v1');
  res.body.v1.should.match(/\/api\/v1$/);
});
