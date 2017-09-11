'use strict';

const CIO = require('customerio-node');
const logger = require('winston');

// const BlinkRetryError = require('../errors/BlinkRetryError');
const Worker = require('./Worker');

class CustomerIoCampaignSignupEventWorker extends Worker {
  constructor(blink) {
    super(blink);
    this.blink = blink;

    this.cioConfig = this.blink.config.customerio;

    // Bind process method to queue context
    this.consume = this.consume.bind(this);
  }

  setup() {
    this.queue = this.blink.queues.userSignupEventQ;
    this.cioClient = new CIO(this.cioConfig.apiKey, this.cioConfig.siteId);
  }

  async consume(campaignSignupEventMessage) {
    console.dir(campaignSignupEventMessage.getData(), { colors: true, showHidden: true });

    this.log(
      'debug',
      campaignSignupEventMessage,
      'Customer.io signup tracked',
      'success_cio_signup_tracked',
    );
  }

  async log(level, message, text, code = 'unexpected_code') {
    const meta = {
      env: this.blink.config.app.env,
      code,
      worker: this.constructor.name,
      request_id: message ? message.getRequestId() : 'not_parsed',
    };
    // Todo: log error?
    logger.log(level, `${text}, message ${message.toString()}`, meta);
  }
}

module.exports = CustomerIoCampaignSignupEventWorker;
