'use strict';

const NorthstarRelayBaseWorker = require('./NorthstarRelayBaseWorker');
const northstarHelper = require('./lib/helpers/northstar');

class CustomerIoEmailUnsubscribedNorthstarWorker extends NorthstarRelayBaseWorker {
  setup() {
    super.setup({
      queue: this.blink.queues.quasarCustomerIoEmailUnsubscribedQ,
      rateLimit: this.blink.config.workers.northstar.userUpdateSpeedLimit,
    });
    this.emailUnsubscribedProperty = this.blink.config.workers.northstar.emailUnsubscribed.property;
    this.emailUnsubscribedValue = this.blink.config.workers.northstar.emailUnsubscribed.value;
  }

  async consume(message) {
    const userId = message.getUserId();
    const body = {};
    body[this.emailUnsubscribedProperty] = this.emailUnsubscribedValue;
    const headers = northstarHelper.getRequestHeaders(message);

    try {
      const response = await northstarHelper.updateUserById(userId, {
        headers,
        body,
      });
      return this.handleResponse(message, response);
    } catch (error) {
      return this.logUnreachableNorthstarAndRetry(error, message);
    }
  }

  static getLogCode(name) {
    const logCodes = {
      retry: 'error_customerio_email_unsubscribed_northstar_response_not_200_retry',
      success: 'success_customerio_email_unsubscribed_northstar_response_200',
      suppress: 'success_customerio_email_unsubscribed_relay_northstar_retry_suppress',
      unprocessable: 'error_customerio_email_unsubscribed_northstar_response_422',
    };
    return logCodes[name];
  }
}

module.exports = CustomerIoEmailUnsubscribedNorthstarWorker;
