'use strict';

module.exports = {
  user: process.env.BLINK_AMQP_USER || 'blink',
  password: process.env.BLINK_AMQP_PASSWORD || 'blink',
  host: process.env.BLINK_AMQP_HOST || 'localhost',
  port: process.env.BLINK_AMQP_PORT || '5672',
  vhost: process.env.BLINK_AMQP_VHOST || 'blink',
  exchange: process.env.BLINK_AMQP_EXCHANGE || 'blink-x',
};
