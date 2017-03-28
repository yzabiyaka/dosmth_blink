'use strict';

// Initialize express.
const config = {};

// Server listen settings
config.port = process.env.PORT || 5050;
config.host = process.env.HOST || 'localhost';

module.exports = config;
