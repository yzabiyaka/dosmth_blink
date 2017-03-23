'use strict';

/**
 * Test environment overrides.
 *
 * Ignoring no-param-reassign eslint rule because it's exactly what we want here.
 */

/* eslint-disable no-param-reassign */

module.exports = (locals) => {
  // Randomize port for test runner.
  // Port 0 means random port:
  // https://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback
  locals.express.port = 0;

  // Test exchange name.
  // TODO: Randomize exchange name.
  locals.amqp.exchange = 'test-x';
};
