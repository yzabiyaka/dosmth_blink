'use strict';

const GambitConversationsRelayWorker = require('./GambitConversationsRelayWorker');
const gambitHelper = require('../lib/helpers/gambit');

class TwilioSmsOutboundErrorRelayWorker extends GambitConversationsRelayWorker {
  setup() {
    super.setup({
      queue: this.blink.queues.twilioSmsOutboundErrorRelayQ,
    });
    this.logCodes = {
      retry: 'error_gambit_outbound_error_relay_response_not_200_retry',
      success: 'success_gambit_outbound_error_relay_response_200',
      suppress: 'success_gambit_outbound_error_relay_retry_suppress',
      unprocessable: 'error_gambit_outbound_error_relay_response_422',
    };
  }

  async consume(message) {
    const messageId = await this.getMessageIdToUpdate(message);
    const body = JSON.stringify(gambitHelper.getFailedAtUpdateBody(message.getData()));
    const headers = this.getRequestHeaders(message);
    const response = await gambitHelper.updateMessage(messageId, {
      headers,
      body,
    });
    this.handleResponse(message, response);
  }

  async getMessageIdToUpdate(message) {
    const messageSid = message.getData().MessageSid;
    const headers = this.getRequestHeaders(message);
    const response = await gambitHelper.getMessageIdBySid(messageSid, {
      headers,
    });
    this.handleResponse(message, response);
    return gambitHelper.parseMessageIdFromResponse(response);
  }
}

module.exports = TwilioSmsOutboundErrorRelayWorker;
