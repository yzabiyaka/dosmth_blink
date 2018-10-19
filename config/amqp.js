'use strict';

// See http://www.squaremobius.net/amqp.node/channel_api.html#connecting-with-an-object-instead-of-a-url
module.exports = {
  // AMQP connection settings.
  connection: {
    protocol: 'amqp',
    hostname: 'rhino.rmq.cloudamqp.com',
    port: '5672',
    username: 'lcwcwqql',
    password: 'v8uI7vRvPPzfvMoHs0YqBt1-zjVyHlJa',
    vhost: 'lcwcwqql',
  },
  settings: {
    topicExchange: process.env.BLINK_AMQP_TOPIC_EXCHANGE || 'blink-topic',
  },
};
