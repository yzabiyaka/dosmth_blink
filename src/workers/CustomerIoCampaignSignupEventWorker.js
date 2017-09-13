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
    // Helper variables.
    const msgData = campaignSignupEventMessage.getData();

    // Convert campaign signup event to cio event.
    let customerIoEvent;
    try {
      // For now all messages are new
      customerIoEvent = campaignSignupEventMessage.toCustomerIoEvent();
    } catch (error) {
      meta = {
        env: this.blink.config.app.env,
        code: 'error_cio_update_cant_convert_campaign_signup',
        worker: this.constructor.name,
        request_id: campaignSignupEventMessage.getRequestId(),
      };
      logger.warning(
        `Can't convert signup event to cio event: ${msgData.id} error ${error}`,
        meta,
      );
    }

    try {
      await this.cioClient.track(customerIoEvent.getId(), {
        name: customerIoEvent.getName(),
        data: customerIoEvent.getData(),
      });
    } catch (error) {
      this.log(
        'warning',
        campaignSignupEventMessage,
        `${error}`,
        'error_cio_update_cant_track_campaign_signup',
      );
      throw new BlinkRetryError(
        `Unexpected customer.io error: ${error}`,
        campaignSignupEventMessage,
      );
    }

    this.log(
      'debug',
      campaignSignupEventMessage,
      'Customer.io campaign signup tracked',
      'success_cio_track_campaign_signup',
    );

    return true;
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
