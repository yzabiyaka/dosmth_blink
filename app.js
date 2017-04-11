'use strict';

// ------- Imports -------------------------------------------------------------

const Blink = require('./src/Blink.js');
const config = require('./config');

// ------- Args parse ----------------------------------------------------------

// TODO: Arg parse
const bootstrapLevel = process.argv[2];
const workerName = process.argv[3];

// ------- Bootstrap -----------------------------------------------------------

const blink = new Blink(config);

switch (bootstrapLevel) {
  case 'web':
    blink.bootstrapWeb();
    break;
  case 'worker':
    blink.bootstrapWorker(workerName);
    break;
  default:
    // Shouldn't happen
}
