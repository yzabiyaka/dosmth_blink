'use strict';

// It's completely legit approach to use await inside loops in this specific case.
// See https://eslint.org/docs/rules/no-await-in-loop:
// > When Not To Use It:
// > Loops may be used to retry asynchronous operations that were unsuccessful.
// > In such cases it makes sense to use await within a loop and it is
// > recommended to disable the rule via a standard ESLint disable comment.
/* eslint-disable no-await-in-loop */

// ------- Imports -------------------------------------------------------------

const logger = require('winston');

// ------- Internal imports ----------------------------------------------------

const DelayLogic = require('./DelayLogic');

// ------- Class ---------------------------------------------------------------

class ReconnectManager {
  constructor(reconnectDelayLogic = false) {
    // Reconnect attempt
    this.attempt = 0;
    // Reconnect allowance.
    this.reconnectAllowed = true;
    // Clean exit indicator.
    this.interrupted = false;

    // Reconnect delay logic.
    if (!reconnectDelayLogic || typeof reconnectDelayLogic !== 'function') {
      // Default exponential backoff logic
      // Default: reconnect every 1 seconds
      this.getReconnectDelay = DelayLogic.constantTimeDelay(1000);
    } else {
      this.getReconnectDelay = reconnectDelayLogic;
    }
  }

  /**
   * Reconnect API
   * @param  {functuon} connectFunction The function to be called
   *
   * Connect function should:
   *  - be async
   *  - return true or false
   *  - handle all underlying exceptions
   *
   * @return {[bool]} ConnectFunction's execution result
   */
  async reconnect(connectFunction) {
    // No retry limit on reconnection.
    while (this.reconnectAllowed) {
      const result = await connectFunction();
      if (result) {
        return result;
      }

      this.attempt += 1;
      const delayMs = this.getReconnectDelay(this.attempt);
      ReconnectManager.logAttempt(this.attempt, delayMs);

      // Wait.
      await ReconnectManager.wait(delayMs);
    }
    // Let know this.interrupt of clean finish.
    this.interrupted = true;
    return false;
  }

  async interrupt() {
    this.reconnectAllowed = false;
    // Wait for clean finish of this.reconnect().
    // Clean finish will be exposed throug this.interrupted state.
    while (!this.interrupted) {
      const delayMs = this.getReconnectDelay(this.attempt);
      await ReconnectManager.wait(delayMs);
    }
    return true;
  }

  static async wait(delayMs) {
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }

  static logAttempt(attempt, delayMs) {
    // Log retry information.
    logger.debug(
      `Reconnect scheduled in ${delayMs}ms, attempt ${attempt}`,
      {
        code: 'debug_reconnect_manager_reconnect_scheduled',
      },
    );
  }
}

// ------- Exports -------------------------------------------------------------

module.exports = ReconnectManager;

// ------- End -----------------------------------------------------------------
