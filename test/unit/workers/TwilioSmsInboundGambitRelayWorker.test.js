'use strict';

// ------- Imports -------------------------------------------------------------

const chai = require('chai');
const fetch = require('node-fetch');
const test = require('ava');

const gambitHelper = require('../../../src/lib/helpers/gambit');
const workerHelper = require('../../../src/lib/helpers/worker');
const TwilioSmsInboundGambitRelayWorker = require('../../../src/workers/TwilioSmsInboundGambitRelayWorker');
const MessageFactoryHelper = require('../../helpers/MessageFactoryHelper');

// ------- Init ----------------------------------------------------------------

const should = chai.should();
const { Response } = fetch;

// ------- Tests ---------------------------------------------------------------

test('getLogCode should be setup and have correct logs', () => {
  const logNames = ['retry', 'success', 'suppress', 'unprocessable'];

  logNames.forEach((name) => {
    const code = TwilioSmsInboundGambitRelayWorker.getLogCode(name);
    should.exist(code);

    if (code) {
      code.should.contain('gambit_inbound');
    }
  });
});

test('Gambit Broadcast relay should receive correct retry count if message has been retried', () => {
  // No retry property:
  gambitHelper.getRequestHeaders(MessageFactoryHelper.getValidInboundMessageData())
    .should.not.have.property('x-blink-retry-count');

  // retry = 0
  const retriedZero = MessageFactoryHelper.getValidInboundMessageData();
  gambitHelper.getRequestHeaders(retriedZero)
    .should.not.have.property('x-blink-retry-count');

  // retry = 1
  const retriedOnce = MessageFactoryHelper.getValidInboundMessageData();
  retriedOnce.incrementRetryAttempt();
  gambitHelper.getRequestHeaders(retriedOnce)
    .should.have.property('x-blink-retry-count').and.equal(1);
});

// TODO: Move this test to the helper/worker test when created
test('Test Gambit response with x-blink-retry-suppress header', () => {
  // Gambit order retry suppression
  const retrySuppressResponse = new Response(
    'Unknown Gambit error',
    {
      status: 422,
      statusText: 'Unknown Gambit error',
      headers: {
        // Also make sure that blink recongnizes non standart header case
        'X-BlInK-RetRY-SuPPRESS': 'TRUE',
      },
    },
  );

  workerHelper.checkRetrySuppress(retrySuppressResponse).should.be.true;


  // Normal Gambit 422 response
  const normalFailedResponse = new Response(
    'Unknown Gambit error',
    {
      status: 422,
      statusText: 'Unknown Gambit error',
      headers: {
        'x-taco-count': 'infinity',
      },
    },
  );
  workerHelper.checkRetrySuppress(normalFailedResponse).should.be.false;
});

// ------- End -----------------------------------------------------------------
