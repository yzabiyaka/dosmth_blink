'use strict';

const BlinkError = require('../errors/BlinkError');
const CustomerIoCampaignSignupPostWorker = require('../workers/CustomerIoCampaignSignupPostWorker');
const CustomerIoCampaignSignupWorker = require('../workers/CustomerIoCampaignSignupWorker');
const CustomerIoSmsBroadcastRelayWorker = require('../workers/CustomerIoSmsBroadcastRelayWorker');
const CustomerIoUpdateCustomerWorker = require('../workers/CustomerIoUpdateCustomerWorker');
const FetchWorker = require('../workers/FetchWorker');
const GambitCampaignSignupRelayWorker = require('../workers/GambitCampaignSignupRelayWorker');
const GambitChatbotMdataProxyWorker = require('../workers/GambitChatbotMdataProxyWorker');
const GambitMessageDataRelayWorker = require('../workers/GambitMessageDataRelayWorker');
const TwilioSmsBroadcastGambitRelayWorker = require('../workers/TwilioSmsBroadcastGambitRelayWorker');
const TwilioSmsInboundGambitRelayWorker = require('../workers/TwilioSmsInboundGambitRelayWorker');
const BlinkApp = require('./BlinkApp');

class BlinkWorkerApp extends BlinkApp {
  constructor(config, name) {
    super(config);

    const workersMapping = BlinkWorkerApp.getAvailableWorkers();
    if (!workersMapping[name]) {
      throw new BlinkError(`Worker ${name} is not found`);
    }
    this.worker = new workersMapping[name](this);
    // TODO: figure out worker names
    this.workerName = name;
  }

  async reconnect() {
    const success = await super.reconnect();
    if (success) {
      this.worker.setup();
      this.worker.perform();
    }
  }

  // @todo: gracefull worker shutdown
  // async stop() {
  //   await this.worker.gracefulStop();
  //   return await super.reconnect();
  // }

  static getAvailableWorkers() {
    return {
      fetch: FetchWorker,
      'customer-io-campaign-signup': CustomerIoCampaignSignupWorker,
      'customer-io-campaign-signup-post': CustomerIoCampaignSignupPostWorker,
      'customer-io-sms-broadcast-relay': CustomerIoSmsBroadcastRelayWorker,
      'customer-io-update-customer': CustomerIoUpdateCustomerWorker,
      'gambit-campaign-signup-relay': GambitCampaignSignupRelayWorker,
      'gambit-chatbot-mdata-proxy': GambitChatbotMdataProxyWorker,
      'gambit-message-data-relay': GambitMessageDataRelayWorker,
      'twilio-sms-broadcast-gambit-relay': TwilioSmsBroadcastGambitRelayWorker,
      'twilio-sms-inbound-gambit-relay': TwilioSmsInboundGambitRelayWorker,
    };
  }
}

module.exports = BlinkWorkerApp;
