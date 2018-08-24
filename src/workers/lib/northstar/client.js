'use strict';

const EventEmitter = require('events');
const lodash = require('lodash');

const NorthstarEndpointUsers = require('./endpoint-users');

const config = require('../../../../config/workers/lib/northstar');
const clientCredentialsStrategy = require('./auth-strategies/client-credentials').getNewInstance({
  tokenConfig: {
    scope: config.authStrategies.clientCredentials.scopes,
  },
});

/**
 * NorthstarClient
 * @extends EventEmitter
 */
class NorthstarClient extends EventEmitter {
  /**
   * Create a new client
   *
   * @param  {Object} opts
   * @param  {Array} strategies - Auth strategies the client will support
   */
  constructor(opts) {
    super();
    this.strategies = [clientCredentialsStrategy];
    this.config = config;
    this.baseUri = opts.baseUri || config.baseUri;
    this.setup();

    // Endpoints
    this.Users = new NorthstarEndpointUsers(this);
  }
  /**
   * request - Gets a request client that is authorized by the strategy named in the strategyName
   * argument. The goal is that each strategy should implement the getAuthorizedClient method.
   *
   * @param  {string} strategyName
   * @return {Object} Authorized client
   */
  request(strategyName) {
    if (!strategyName) {
      throw new Error('NorthstarClient.request: a strategyName is required');
    }
    return this.availableStrategies[strategyName].getAuthorizedClient();
  }
  /**
   * @static getNewInstance
   *
   * @param  {Object} opts = {}
   * @param  {Array} strategies = []
   * @return {NorthstarClient}
   */
  static getNewInstance(opts = {}) {
    return new NorthstarClient(opts);
  }

  /**
   * setup - Initializes each strategy and creates a map of the camelCased strategy names and the
   * strategy instances.
   */
  setup() {
    this.availableStrategies = {};
    this.strategies.forEach((strategy) => {
      const name = lodash.camelCase(strategy.constructor.name);
      this.availableStrategies[name] = strategy;
      strategy.setup();
    });
  }
}

module.exports = NorthstarClient;
