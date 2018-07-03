'use strict';

const logger = require('winston');

const GambitConversationsRelayBaseWorker = require('./GambitConversationsRelayBaseWorker');
const gambitHelper = require('../lib/helpers/gambit');

class GambitCampaignSignupRelayWorker extends GambitConversationsRelayBaseWorker {
  setup() {
    super.setup({
      queue: this.blink.queues.gambitCampaignSignupRelayQ,
    });
    this.logCodes = {
      retry: 'error_gambit_campaign_signup_relay_response_not_200_retry',
      success: 'success_gambit_campaign_signup_relay_response_200',
      suppress: 'success_gambit_campaign_signup_relay_retry_suppress',
      unprocessable: 'error_gambit_campaign_signup_relay_response_422',
      skip: 'success_gambit_campaign_signup_relay_expected_skip',
    };
  }

  async consume(message) {
    let response;
    const data = message.getData();
    // Send only delivered messages to Gambit Conversations import.
    if (GambitCampaignSignupRelayWorker.shouldSkip(message)) {
      return this.logSkip(message);
    }
    // See https://github.com/DoSomething/gambit-conversations/blob/master/documentation/endpoints/send-message.md
    const body = JSON.stringify({
      northstarId: data.northstar_id,
      campaignId: data.campaign_id,
      source: data.source,
    });

    try {
      response = await gambitHelper.relayCampaignSignupMessage(message, {
        body,
      });
    } catch (error) {
      return this.logUnreachableGambitConversationsAndRetry(error, message);
    }

    return this.handleResponse(message, response);
  }

  static shouldSkip(message) {
    const source = message.getData().source;
    if (!source) {
      return false;
    }
    return source.match(/^ *sms/) !== null;
  }

  logSkip(message) {
    const meta = {
      env: this.blink.config.app.env,
      code: this.logCodes.skip,
      worker: this.workerName,
      request_id: message ? message.getRequestId() : 'not_parsed',
    };
    logger.log('debug', JSON.stringify(message.getData()), meta);
    return true;
  }
}

module.exports = GambitCampaignSignupRelayWorker;
