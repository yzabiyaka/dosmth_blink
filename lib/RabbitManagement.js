'use strict';

require('isomorphic-fetch');
const URL = require('url');

class RabbitManagement {
  constructor({ protocol, hostname, port, username, password, vhost }) {
    this.baseURL = URL.format({
      protocol,
      hostname,
      port,
      // Plugin rabbitmq_management API always lives under /api/
      pathname: '/api/',
    });

    // Create basic auth header.
    this.authHeader = Buffer(`${username}:${password}`).toString('base64');

    // Expose AMQP vhost for building correct API endpoints.
    this.vhost = vhost;
  }

  async getQueueInfo(queue) {
    const endpoint = `/queues/${this.vhost}/${queue.name}`;
    let response = {};
    try {
      response = await this.get(endpoint);
    } catch (error) {
      // Wrap HTTP exceptions in meaningful response.
      throw new Error(`Incorrect RabbitManagement.getQueueInfo() response for GET ${endpoint}: ${error.message}`);
    }
    return response;
  }

  async getQueueBindings(queue) {
    const endpoint = `/bindings/${this.vhost}/e/${queue.exchange.name}/q/${queue.name}`;
    const response = await this.get(endpoint);
    // Response always returns 200 and valid JSON.
    // Return false when not bindings found.
    if (response.length < 1) {
      return false;
    }
    return response;
  }

  async get(endpoint) {
    const options = this.getFetchDefaults();
    const response = await fetch(this.fullUri(endpoint), options);
    const data = this.handleFetchResponse(response);
    return data;
  }

  handleFetchResponse(response) {
    // Tolerate "200 OK" responses only.
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }

    // Always expect correct 200 response to have JSON body.
    return response.json();
  }

  fullUri(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  getFetchDefaults() {
    return {
      headers: {
        Authorization: `Basic ${this.authHeader}`,
      },
    };
  }
}

module.exports = RabbitManagement;
