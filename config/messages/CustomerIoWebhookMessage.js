'use strict';

const config = {};
/**
 * Keys should match event names in C.io.
 *
 * @see https://customer.io/docs/developer-documentation/webhooks.html#events
 *
 * WARNING: In the worst case scenario that C.io changes an event
 * name without letting us know, this would be the place to fix routing issues.
 */
config.events = {
  /**
   * This is a catch all "generic" events that we will fallback to if we don't have a specific
   * C.io event config here.
   */
  generic: {
    routingKey: '*.event.quasar',
  },
  email_unsubscribed: {
    routingKey: 'email-unsubscribed.event.quasar',
  },
};

module.exports = config;
