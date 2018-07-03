'use strict';

const GambitConversationsRelayBaseWorker = require('./GambitConversationsRelayBaseWorker');
const gambitHelper = require('../lib/helpers/gambit');

class TwilioSmsInboundGambitRelayWorker extends GambitConversationsRelayBaseWorker {
  setup() {
    super.setup({
      queue: this.blink.queues.twilioSmsInboundGambitRelayQ,
    });
    this.logCodes = {
      retry: 'error_gambit_inbound_relay_response_not_200_retry',
      success: 'success_gambit_inbound_relay_response_200',
      suppress: 'success_gambit_inbound_relay_retry_suppress',
      unprocessable: 'error_gambit_inbound_relay_response_422',
    };
  }

  async consume(message) {
    let response;

    const body = JSON.stringify(message.getData());

    try {
      response = await gambitHelper.relayTwilioInboundMessage(message, {
        body,
      });
    } catch (error) {
      return this.logUnreachableGambitConversationsAndRetry(error, message);
    }
    return this.handleResponse(message, response);
  }
}

module.exports = TwilioSmsInboundGambitRelayWorker;
