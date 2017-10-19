'use strict';

// ------- Imports -------------------------------------------------------------

const test = require('ava');
const chai = require('chai');

const Dequeuer = require('../../src/lib/Dequeuer');

// ------- Init ----------------------------------------------------------------

chai.should();

// ------- Tests ---------------------------------------------------------------

/**
 * Dequeuer.retryDelay(): Check retryDelay behavior
 */
test('Dequeuer.retryDelay(): Check retryDelay behavior', () => {
  // First, delay between retries should be a matter of seconds
  Dequeuer.retryDelay(0).should.be.equal(1000);
  Dequeuer.retryDelay(1).should.be.equal(1250);
  Dequeuer.retryDelay(2).should.be.equal(2000);

  // Delay should be between 20 and 30 sec on 10th retry.
  Dequeuer.retryDelay(10).should.be.above(20000).and.below(30000);

  // Delay should be between 1 and 2 minutes on 20th retry.
  Dequeuer.retryDelay(20).should.be.above(1 * 60 * 1000).and.below(2 * 60 * 1000);

  // Delay should be between 3 and 4 minutes on 30th retry.
  Dequeuer.retryDelay(30).should.be.above(3 * 60 * 1000).and.below(4 * 60 * 1000);

  // Delay should be between 10 and 20 minutes on 50th retry.
  Dequeuer.retryDelay(50).should.be.above(10 * 60 * 1000).and.below(20 * 60 * 1000);

  // Delay should be between 30 minutes and 1 hour on 100th retry.
  Dequeuer.retryDelay(100).should.be.above(30 * 60 * 1000).and.below(60 * 60 * 1000);

  // Total wait time whould be less than a day.
  let retry = 0;
  let accumulator = 0;
  while (retry <= 100) {
    accumulator += Dequeuer.retryDelay(retry);
    retry += 1;
  }
  accumulator.should.be.below(60 * 60 * 1000 * 24);
});

// ------- End -----------------------------------------------------------------
