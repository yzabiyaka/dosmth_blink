'use strict';

/**
 * Imports.
 */
const test = require('ava');
const supertest = require('supertest');
require('chai').should();
const blinkWeb = require('../../src/web/blinkWeb');

/**
 * Test GET / with no auth
 */
test('GET / should turn down anonymous requests', async () => {
  const res = await supertest(blinkWeb.callback()).get('/');
  res.status.should.be.equal(401);
  res.text.should.be.have.string('Don\'t blink');
});


/**
 * Test GET /.
 */
test('GET / should be polite', async () => {
  const config = require('../../config');
  const res = await supertest(blinkWeb.callback())
    .get('/')
    .auth(config.app.auth.name, config.app.auth.password);
  res.status.should.be.equal(200);
  res.text.should.be.equal('Hi, I\'m Blink!');
});
