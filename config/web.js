'use strict';

const config = {};

// Server bind port settings.
// In addition, defaults to PORT env variable for compatibility with heroku.
config.bind_port = process.env.BLINK_WEB_BIND_PORT || process.env.PORT || 5050;
// Server bind IP address setting.
// When ommited, dafaults to :: or 0.0.0.0 based on ip setting.
config.bind_address = process.env.BLINK_WEB_BIND_ADDRESS || '';
// Base URI
config.hostname = process.env.BLINK_WEB_HOSTNAME || 'localhost';
// Base URI port
config.port = process.env.BLINK_WEB_PORT || config.bind_port || 80;
// Base URI protocol
config.protocol = process.env.BLINK_WEB_PROTOCOL || 'http';

module.exports = config;
