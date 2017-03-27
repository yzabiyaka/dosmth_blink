'use strict';

const fs = require('fs');

// Settings.
const config = {};

// Logger
config.app = require('./app');
config.logger = require('./logger');
config.express = require('./express');
config.amqp = require('./amqp');
config.amqpManagement = require('./amqpManagement');

// Require env-dependent configs
const envConfigPath = `${__dirname}/env/override-${config.app.env}.js`;

try {
  const stats = fs.lstatSync(envConfigPath);
  if (stats.isFile()) {
    // Apply environment overrides.
    // We really want dynamic require here, so forcing eslint to ignore next line.
    // eslint-disable-next-line import/no-dynamic-require, global-require
    require(envConfigPath)(config);
  }
} catch (error) {
  // Just don't include env-dependent override when there's no file.
}

module.exports = config;
