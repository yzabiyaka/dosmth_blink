'use strict';

const logger = require('winston');

const BlinkRetryError = require('../errors/BlinkRetryError');
const Worker = require('./Worker');

/**
 * Represents a GambitConversationsRelay type of worker.
 * Workers that intend to relay messages to G-Conversations should inherit from this Worker.
 */
class GambitConversationsRelayWorker extends Worker {
  setup({ queue }) {
    super.setup({ queue });
    this.logCodes = {
      retry: 'error_gambit_conversations_response_not_200_retry',
      success: 'success_gambit_conversations_response_200',
      suppress: 'success_gambit_conversations_retry_suppress',
      unprocessable: 'error_gambit_conversations_response_422',
    };
    // Setup Gambit Conversations
    this.apiKey = this.blink.config.gambit.conversations.apiKey;
    this.allowedStatuses = [200, 204, 422];
  }

  /**
   * handleResponse - Takes in a node-fetch response and determines if the request should be
   * retried, or logged.
   *
   * @param  {Object} message
   * @param  {Object} response node-fetch response
   * @return {boolean}
   */
  handleResponse(message, response) {
    if (this.shouldRetry(response)) {
      return this.logAndRetry(message, response);
    }
    return this.logResponse(message, response);
  }

  /**
   * logResponse
   *
   * @param  {Object} message
   * @param  {Object} response node-fetch response
   * @return {boolean}
   */
  logResponse(message, response) {
    if (response.status === 200 || response.status === 204) {
      return this.logSuccess(message, response);
    } else if (this.checkRetrySuppress(response)) {
      return this.logSuppressedRetry(message, response);
    } else if (response.status === 422) {
      return this.logUnprocessableEntity(message, response);
    }
    return true;
  }

  /**
   * shouldRetry - The request should not retry if the status code is one of the allowed codes, or
   * if G-Conversations returned the suppress retry header
   *
   * @param  {Object} response node-fetch response
   * @return {boolean}
   */
  shouldRetry(response) {
    const allowedStatus = this.allowedStatuses.includes(response.status);
    const suppressed = this.checkRetrySuppress(response);

    if (suppressed || allowedStatus) {
      return false;
    }
    return true;
  }

  logAndRetry(message, response) {
    this.log(
      'warning',
      message,
      response,
      this.logCodes.retry,
    );

    throw new BlinkRetryError(
      `${response.status} ${response.statusText}`,
      message,
    );
  }

  /**
   * logSuccess
   *
   * @param  {Object} message
   * @param  {Object} response node-fetch response
   * @return {boolean}
   */
  logSuccess(message, response) {
    this.log(
      'debug',
      message,
      response,
      this.logCodes.success,
    );
    return true;
  }

  /**
   * logSuppressedRetry
   *
   * @param  {Object} message
   * @param  {Object} response node-fetch response
   * @return {boolean}
   */
  logSuppressedRetry(message, response) {
    this.log(
      'debug',
      message,
      response,
      this.logCodes.suppress,
    );
    return true;
  }

  /**
   * logUnprocessableEntity
   *
   * @param  {Object} message
   * @param  {Object} response node-fetch response
   * @return {boolean}
   */
  logUnprocessableEntity(message, response) {
    this.log(
      'warning',
      message,
      response,
      this.logCodes.unprocessable,
    );
    return false;
  }

  /**
   * async log - description
   *
   * @async
   * @param  {string} level                    log level
   * @param  {Object} message
   * @param  {Object} response                 node-fetch response
   * @param  {string} code = 'unexpected_code'
   */
  async log(level, message, response, code = 'unexpected_code') {
    const meta = {
      env: this.blink.config.app.env,
      code,
      worker: this.constructor.name,
      request_id: message ? message.getRequestId() : 'not_parsed',
      response_status: response.status,
      response_status_text: `"${response.statusText}"`,
    };
    // Todo: log error?
    logger.log(level, '', meta);
  }

  /**
   * getRequestHeaders - Get G-Conversations specific headers for this message
   *
   * @param  {Object} message
   * @return {Object}
   */
  getRequestHeaders(message) {
    const headers = {
      Authorization: `Basic ${this.apiKey}`,
      'X-Request-ID': message.getRequestId(),
      'Content-type': 'application/json',
    };

    if (message.getRetryAttempt() > 0) {
      headers['x-blink-retry-count'] = message.getRetryAttempt();
    }

    return headers;
  }

  /**
   * checkRetrySuppress - Looks for the suppress headers in the node-fetch response
   *
   * @param  {Object} response node-fetch response
   * @return {boolean}
   */
  checkRetrySuppress(response) {
    // TODO: create common helper
    const headerResult = response.headers.get(this.blink.config.app.retrySuppressHeader);
    if (!headerResult) {
      return false;
    }
    return headerResult.toLowerCase() === 'true';
  }
}

module.exports = GambitConversationsRelayWorker;
