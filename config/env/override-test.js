'use strict';

/**
 * Test environment overrides.
 *
 * Ignoring no-param-reassign eslint rule because it's exactly what we want here.
 */

/* eslint-disable no-param-reassign */

module.exports = (locals) => {
  // Randomize port for test runner.
  // Port 0 means random port.
  locals.express.port = 0;
};
