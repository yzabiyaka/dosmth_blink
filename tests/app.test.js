'use strict';

const test = require('ava');
const should = require('chai').should();;
const supertest = require('supertest');
const app = require('../app')

test('GET /', async (t) => {
  const res = await supertest(app).get('/');
  res.status.should.be.equal(200);
  res.text.should.be.equal('Hello World!');
});
