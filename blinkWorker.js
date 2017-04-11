'use strict';

/**
 * Imports.
 */
const config = require('./config');
const Initializer = require('./src/lib/Initializer');

/**
 * Initializations.
 */
// Chdir to project root to ensure that relative paths work.
process.chdir(__dirname);

// TODO: get worker name
// const name = process.argv[2];
// if (!name) {
//   config.logger.error('No worker name provided, shutting down.');
//   process.exit(1);
// }

// Setup rabbit.
config.initializer = new Initializer(config);
config.initializer.getFetchQ().then((queue) => {
  queue.startConsuming();
});
