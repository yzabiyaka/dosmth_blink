'use strict';

const config = require('../../../../config/workers/lib/identity-service');
const clientCredentialsStrategy = require('./auth-strategies/client-credentials').getNewInstance({
  tokenConfig: {
    scope: config.authStrategies.clientCredentials.scopes,
  },
});

/**
 * NorthstarClient
 */
class IdentityService {
  /**
   * Create a new client
   *
   * @param  {Object} opts
   * @param  {Array} strategies - Auth strategies the client will support
   */
  constructor(strategy) {
    this.strategy = strategy || clientCredentialsStrategy;
    this.config = config;
    this.strategy.setup();
  }
  /**
   * getAuthHeader - Gets the Authorization header by the strategy sent in the strategyName
   * argument. Each strategy MUST implement the getAuthHeader method.
   *
   * @return {Object} Authorization headers
   */
  getAuthHeader() {
    return this.strategy.getAuthHeader();
  }
}

module.exports = IdentityService;
