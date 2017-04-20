'use strict';

// ------- New Relic first ------------------------------------------------------
require('newrelic');

// ------- Imports -------------------------------------------------------------
const yargs = require('yargs');
const config = require('./config');
const BlinkWebApp = require('./src/app/BlinkWebApp.js');
const BlinkWorkerApp = require('./src/app/BlinkWorkerApp.js');

// ------- Args parse ----------------------------------------------------------

// TODO: list workers
const argv = yargs
  .usage('Usage: node $0 <command>')
  .version(config.app.version)
  .command('web', 'Start a web app')
  .command('worker <name>', 'Start worker with the given name')
  .demandCommand(1, 'Please provide a valid command')
  .help()
  .argv;

// ------- App bootstrap -------------------------------------------------------

let blinkApp;
const [command] = argv._;
switch (command) {
  case 'web':
    blinkApp = new BlinkWebApp(config);
    break;
  case 'worker':
    blinkApp = new BlinkWorkerApp(config, argv.name);
    break;
  default:
    throw new Error('Argument parsing integrity violation');
}

blinkApp.start();

// ------- End -----------------------------------------------------------------
