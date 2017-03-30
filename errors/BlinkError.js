'use strict';

class BlinkError extends Error {
  /**
   * Blink generic error constructor.
   *
   * See http://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

module.exports = BlinkError;
