'use strict';

// Initialize express.
const config = {};

// Environment
config.env = process.env.NODE_ENV || 'development';

// Port
config.port = process.env.LISTEN_PORT || 5050;

module.exports = config;
