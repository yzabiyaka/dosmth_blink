'use strict';

const CIO = require('customerio-node');
const logger = require('winston');

const BlinkRetryError = require('../errors/BlinkRetryError');
const CustomerIoIdentifyMessage = require('../messages/CustomerIoIdentifyMessage');
const Worker = require('./Worker');

class CustomerIoUpdateCustomerWorker extends Worker {

  constructor(blink) {
    super(blink);
    this.blink = blink;

    this.cioConfig = this.blink.config.customerio;

    // Bind process method to queue context
    this.consume = this.consume.bind(this);
  }

  setup() {
    this.queue = this.blink.queues.customerIoUpdateCustomerQ;
    this.cioClient = new CIO(this.cioConfig.apiKey, this.cioConfig.siteId);
  }

  async consume(userMessage) {
    let meta;
    // Exclude mobile-only users
    if (!userMessage.payload.data.email) {
      meta = {
        env: this.blink.config.app.env,
        code: 'cio_update_skip_mobile_only',
        worker: this.constructor.name,
        request_id: userMessage ? userMessage.payload.meta.request_id : 'not_parsed',
      };
      logger.debug(`Skipping mobile only user ${userMessage.payload.data.id}`, meta);
    }

    let customerIoIdentifyMessage;
    try {
      customerIoIdentifyMessage = CustomerIoIdentifyMessage.fromUser(userMessage);
      customerIoIdentifyMessage.validateStrict();
    } catch (error) {
      meta = {
        env: this.blink.config.app.env,
        code: 'error_cio_update_cant_convert_user',
        worker: this.constructor.name,
        request_id: userMessage ? userMessage.payload.meta.request_id : 'not_parsed',
      };
      logger.warning(
        `Can't convert user to cio customer: ${userMessage.payload.data.id} error ${error}`,
        meta
      );
    }

    const { id, data } = customerIoIdentifyMessage.payload.data;

    try {
      await this.cioClient.identify(id, data);
    } catch (error) {
      this.log(
        'warning',
        customerIoIdentifyMessage,
        `${error}`,
        'error_cio_update_cant_update_consumer'
      );
      throw new BlinkRetryError(
        `Unknown customer.io error: ${error}`,
        userMessage
      );
    }

    this.log(
      'debug',
      customerIoIdentifyMessage,
      'Customer.io updated',
      'success_cio_consumer_updated'
    );

    return true;
  }

  async log(level, message, text, code = 'unexpected_code') {
    const meta = {
      env: this.blink.config.app.env,
      code,
      worker: this.constructor.name,
      request_id: message ? message.payload.meta.request_id : 'not_parsed',
    };
    // Todo: log error?
    logger.log(level, `${text}, message ${message.toString()}`, meta);
  }
}

module.exports = CustomerIoUpdateCustomerWorker;
