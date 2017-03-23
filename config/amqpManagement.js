'use strict';

module.exports = {
  username: process.env.BLINK_AMQP_USER || 'blink',
  password: process.env.BLINK_AMQP_PASSWORD || 'blink',
  vhost: process.env.BLINK_AMQP_VHOST || 'blink',
  protocol: process.env.BLINK_AMQP_MANAGEMENT_PROTOCOL || 'http',
  hostname: process.env.BLINK_AMQP_MANAGEMENT_HOSTNAME || 'localhost',
  port: process.env.BLINK_AMQP_MANAGEMENT_PORT || '15672',
};
