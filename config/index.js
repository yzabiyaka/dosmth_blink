'use strict';

const fs = require('fs');

// Settings.
const locals = {};

// Logger
locals.express = require('./express');
locals.logger = require('./logger');
locals.amqp = require('./amqp');
locals.amqpManagement = require('./amqpManagement');

// Require env-dependent configs
const envConfigPath = `${__dirname}/env/override-${locals.express.env}.js`;
const stats = fs.lstatSync(envConfigPath);
if (stats.isFile()) {
  // Apply environment overrides.
  // We really want dynamic require here, so forcing eslint to ignore next line.
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(envConfigPath)(locals);
}

module.exports = locals;
