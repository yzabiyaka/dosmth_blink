'use strict';

const config = {};

// Server bind port settings.
// In addition, defaults to PORT env variable for compatibility with heroku.
config.port = process.env.BLINK_WEB_PORT || process.env.PORT || 5050;
// Server bind IP address setting.
// When ommited, dafaults to :: or 0.0.0.0 based on ip setting.
config.bind_address = process.env.BLINK_WEB_BIND_ADDRESS || '';
// Base URI.
config.hostname = process.env.BLINK_WEB_HOSTNAME || 'localhost';

module.exports = config;
