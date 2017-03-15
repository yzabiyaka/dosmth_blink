'use strict';

// Initialize express.
const config = {};

// Environment
config.env = process.env.NODE_ENV || 'development';

// Port
config.port = process.env.LISTEN_PORT || 5050;

// Randomize port for test runner.
if (config.env === 'test') {
  // Port 0 means random port.
  config.port = 0;
}

module.exports = config;
