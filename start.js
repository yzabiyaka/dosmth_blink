'use strict';

// ------- Imports -------------------------------------------------------------

const yargs = require('yargs');

const config = require('./config');
const packageJson = require('./package.json');
const BlinkWeb = require('./src/blink/BlinkWeb.js');
const BlinkWorker = require('./src/blink/BlinkWorker.js');

// ------- Args parse ----------------------------------------------------------

let blink;

// TODO: list workers
yargs
  .usage('Usage: node $0 <command>')
  .command({
    command: 'web',
    desc: 'Start a web app',
    handler: (argv) => {
      blink = new BlinkWeb(config);
    }
  })
  .command({
    command: 'worker <name>',
    desc: 'Start worker with the given name',
    handler: (argv) => {
      blink = new BlinkWorker(config, argv.name);
    }
  })
  .version(packageJson.version)
  .demandCommand(1, 'Please provide a valid command')
  .help()
  .argv;

// ------- App bootstrap -------------------------------------------------------

blink.start();
