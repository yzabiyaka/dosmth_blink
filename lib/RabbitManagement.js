'use strict';

const axios = require('axios');
const URL = require('url');


class RabbitManagement {
  constructor({protocol, hostname, port, username, password, vhost}) {
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
    });

    // Setup amqp settings.
    this.vhost = vhost;
  }

  async getQueueInfo(queue) {
    const endpoint = `/queues/${this.vhost}/${queue.name}`;
    const response = await this.client.get(endpoint);
    if (!response.data) {
      throw new Error(`Can't load queue info for ${endpoint}`)
    }
    return response.data;
  }
}

module.exports = RabbitManagement;
