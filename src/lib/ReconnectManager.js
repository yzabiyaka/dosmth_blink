'use strict';

const logger = require('winston');

class ReconnectManager {
  constructor() {
    this.connected = false;
    this.connecting = false;
    this.shuttingDown = false;
    this.reconnectTimeout = 2000;
  }

  scheduleReconnect(reconnectable, timeout = 0, code, message) {
    // Don't reconnect on programmatic shutdown.
    if (this.shuttingDown) {
      return;
    }
    const meta = {
      code,
    };
    logger.error(`${message}, reconnecting in ${timeout}ms`, meta);
    this.connected = false;
    setTimeout(this.reconnectable, timeout);
  }
}

module.exports = ReconnectManager;
