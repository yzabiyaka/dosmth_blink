'use strict';

// Initialize express.
const config = {};

// Port
config.port = process.env.LISTEN_PORT || 5050;

module.exports = config;
