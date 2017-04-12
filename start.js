'use strict';

// ------- Imports -------------------------------------------------------------

const BlinkWeb = require('./src/blink/BlinkWeb.js');
const BlinkWorker = require('./src/blink/BlinkWorker.js');
const config = require('./config');

// ------- Args parse ----------------------------------------------------------

// TODO: Arg parse
const bootstrapLevel = process.argv[2];
const workerName = process.argv[3];

// ------- Bootstrap -----------------------------------------------------------

let blink;
switch (bootstrapLevel) {
  case 'web':
    blink = new BlinkWeb(config);
    break;
  case 'worker':
    blink = new BlinkWorker(config, workerName);
    break;
  default:
    // Shouldn't happen
}

blink.start();
