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
   * Create a new service client
   *
   * @param  {ClientCredentials|EventEmitter} [strategy=ClientCredentials] - Auth strategy
   * @param  {Function} strategy.setup - Start the strategy state
   * @param  {Function} strategy.getAuthHeader - Returns the Authorization header w/ valid token
   */
  constructor(strategy = clientCredentialsStrategy) {
    this.strategy = strategy;
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
