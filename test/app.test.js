'use strict';

const test = require('ava');
const supertest = require('supertest');
require('chai').should();
const app = require('../app');

test('GET /', async () => {
  const res = await supertest(app).get('/');
  res.status.should.be.equal(200);
  res.text.should.be.equal('Hello World!');
});
