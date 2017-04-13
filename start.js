'use strict';

// ------- Imports -------------------------------------------------------------

const yargs = require('yargs');

const config = require('./config');
const packageJson = require('./package.json');
const BlinkWebApp = require('./src/app/BlinkWebApp.js');
const BlinkWorkerApp = require('./src/app/BlinkWorkerApp.js');

// ------- Args parse ----------------------------------------------------------

let blinkApp;

// TODO: list workers
yargs
  .usage('Usage: node $0 <command>')
  .version(packageJson.version)
  .command({
    command: 'web',
    desc: 'Start a web app',
    handler: (argv) => {
      blinkApp = new BlinkWebApp(config);
    }
  })
  .command({
    command: 'worker <name>',
    desc: 'Start worker with the given name',
    handler: (argv) => {
      blinkApp = new BlinkWorkerApp(config, argv.name);
    }
  })
  .demandCommand(1, 'Please provide a valid command')
  .help()
  .argv;

// ------- App bootstrap -------------------------------------------------------

blinkApp.start();
