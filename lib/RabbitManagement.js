'use strict';

const axios = require('axios');
const URL = require('url');


class RabbitManagement {
  constructor({ protocol, hostname, port, username, password, vhost }) {
    const baseURL = URL.format({
      protocol,
      hostname,
      port,
      // Plugin rabbitmq_management API always lives under /api/
      pathname: '/api/',
    });

    // Setup HTTP agent.
    this.client = axios.create({
      baseURL,
      auth: {
        username,
        password,
      },
      maxRedirects: 0,
      validateStatus: status => status === 200,
    });

    // Setup amqp settings.
    this.vhost = vhost;
  }

  async getQueueInfo(queue) {
    const endpoint = `/queues/${this.vhost}/${queue.name}`;
    let response = {};
    try {
      response = await this.client.get(endpoint);
    } catch (error) {
      // Wrap HTTP exceptions in meaningful response.
      throw new Error(`Can't parse RabbitManagement::getQueueInfo() response for ${endpoint}: ${error.message}`);
    }
    return response.data;
  }

  async getQueueBindings(queue) {
    const endpoint = `/bindings/${this.vhost}/e/${queue.exchange.name}/q/${queue.name}`;
    const response = await this.client.get(endpoint);
    // Response always returns 200 and valid json.
    return response.data;
  }
}

module.exports = RabbitManagement;
