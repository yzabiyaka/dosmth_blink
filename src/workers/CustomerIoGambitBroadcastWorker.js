'use strict';

const GambitConversationsRelayBaseWorker = require('./GambitConversationsRelayBaseWorker');
const gambitHelper = require('../lib/helpers/gambit');

class CustomerIoGambitBroadcastWorker extends GambitConversationsRelayBaseWorker {
  setup() {
    super.setup({
      queue: this.blink.queues.customerIoGambitBroadcastQ,
      rateLimit: this.blink.config.gambit.broadcastSpeedLimit,
    });
    this.logCodes = {
      retry: 'error_customerio_gambit_broadcast_gambit_response_not_200_retry',
      success: 'success_customerio_gambit_broadcast_gambit_response_200',
      suppress: 'success_customerio_gambit_broadcast_relay_gambit_retry_suppress',
      unprocessable: 'error_customerio_gambit_broadcast_gambit_response_422',
    };
  }

  async consume(message) {
    let response = {};

    const body = JSON.stringify({
      northstarId: message.getNorthstarId(),
      broadcastId: message.getBroadcastId(),
    });

    try {
      response = await gambitHelper.relayBroadcastMessage(message, {
        body,
      });
    } catch (error) {
      return this.logUnreachableGambitConversationsAndRetry(error, message);
    }
    return this.handleResponse(message, response);
  }
}

module.exports = CustomerIoGambitBroadcastWorker;
