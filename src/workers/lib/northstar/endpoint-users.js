'use strict';

const NorthstarEndpoint = require('./endpoint');

class NorthstarEndpointUsers extends NorthstarEndpoint {
  constructor(client) {
    super(client);
    this.endpoint = 'users';
  }
  /**
   * update - Update a single User
   *
   * @see https://github.com/DoSomething/northstar/blob/master/documentation/README.md#users
   * @param  {string|number} userId
   * @param  {Object} query
   * @return {Promise}
   */
  update(userId, update) {
    return this
      .executePut(`${this.endpoint}/${userId}`, update)
      .then(responseBody => responseBody);
  }
}

module.exports = NorthstarEndpointUsers;
