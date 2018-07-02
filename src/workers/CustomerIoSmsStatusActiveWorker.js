'use strict';

const fetch = require('node-fetch');
const logger = require('winston');

const Worker = require('./Worker');
const gambitHelper = require('../lib/helpers/gambit');
const BlinkRetryError = require('../errors/BlinkRetryError');


class CustomerIoSmsStatusActiveWorker extends Worker {
  setup() {
    super.setup({
      queue: this.blink.queues.customerIoSmsStatusActiveQ,
    });
    // Setup Gambit.
    this.baseURL = this.blink.config.gambit.conversations.baseURL;
    this.apiKey = this.blink.config.gambit.conversations.apiKey;
  }

  async consume(message) {
    // TODO: There's a slight chance a previous retry did successfully post to Twilio, but
    // errored after the request, sending a double post.

    let response = {};
    const data = {
      northstarId: message.getNorthstarId(),
    };
    const body = JSON.stringify(data);
    const headers = gambitHelper.getRequestHeaders(message);

    try {
      response = await fetch(
        `${this.baseURL}/messages?origin=subscriptionStatusActive`,
        {
          method: 'POST',
          headers,
          body,
        },
      );
    } catch (error) {
      gambitHelper.logFetchFailure(
        error.toString(),
        message,
        this.queue.name,
        'error_customerio_sms_status_active_gambit_response_not_200_retry',
      );
      throw new BlinkRetryError(
        `${error.toString()}`,
        message,
      );
    }

    if (response.status === 200) {
      this.log(
        'debug',
        message,
        response,
        'success_customerio_sms_status_active_gambit_response_200',
      );
      return true;
    }

    if (this.checkRetrySuppress(response)) {
      this.log(
        'debug',
        message,
        response,
        'success_customerio_sms_status_active_relay_gambit_retry_suppress',
      );
      return true;
    }

    if (response.status === 422) {
      this.log(
        'warning',
        message,
        response,
        'error_customerio_sms_status_active_gambit_response_422',
      );
      return false;
    }

    this.log(
      'warning',
      message,
      response,
      'error_customerio_sms_status_active_gambit_response_not_200_retry',
    );

    throw new BlinkRetryError(
      `${response.status} ${response.statusText}`,
      message,
    );
  }

  async log(level, message, response, code = 'unexpected_code') {
    const cleanedBody = (await response.text()).replace(/\n/g, '\\n');

    const meta = {
      env: this.blink.config.app.env,
      code,
      worker: this.constructor.name,
      request_id: message ? message.getRequestId() : 'not_parsed',
      response_status: response.status,
      response_status_text: `"${response.statusText}"`,
    };
    // Todo: log error?
    logger.log(level, cleanedBody, meta);
  }

  checkRetrySuppress(response) {
    // TODO: create common helper
    const headerResult = response.headers.get(this.blink.config.app.retrySuppressHeader);
    if (!headerResult) {
      return false;
    }
    return headerResult.toLowerCase() === 'true';
  }
}

module.exports = CustomerIoSmsStatusActiveWorker;
