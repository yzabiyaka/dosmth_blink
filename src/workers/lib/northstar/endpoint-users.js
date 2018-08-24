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
   * @param  {string|number} id
   * @param  {Object} query
   * @return {Promise}
   */
  update(id, update) {
    return this
      .executePut(`${this.endpoint}/${id}`, update)
      .then(responseBody => responseBody);
  }
}

module.exports = NorthstarEndpointUsers;
