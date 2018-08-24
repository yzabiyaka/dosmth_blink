'use strict';

const logger = require('winston');

const NorthstarClient = require('./client');

let northstarClient;

function getClient() {
  if (!northstarClient) {
    northstarClient = NorthstarClient.getNewInstance();
  }
  return northstarClient;
}

function updateUserById(userId, update) {
  logger.debug(userId, update);
  return module.exports.getClient().Users.update(userId, update);
}

function getConfig() {
  return getClient().config;
}

module.exports = {
  getClient,
  getConfig,
  updateUserById,
};
