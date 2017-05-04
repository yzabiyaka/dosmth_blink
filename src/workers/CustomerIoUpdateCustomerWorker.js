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
    this.cioClient = new CIO(this.cioConfig.siteId, this.cioConfig.apiKey);
  }

  async consume(userMessage) {
    const customerIoMessage = CustomerIoIdentifyMessage.fromUser(userMessage);
    console.dir(customerio, { colors: true, showHidden: true });


    // const result = this.cioClient.identify(
    //   customerIoMessage.id,
    //   customerIoMessage.payload.data
    // );

    // console.dir(result, { colors: true, showHidden: true });

    // const data = mdataMessage.payload.data;

    // const url = `${this.gambitBaseUrl}/chatbot`;
    // const response = await fetch(
    //   url,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'x-gambit-api-key': this.gambitApiKey,
    //       'X-Request-ID': mdataMessage.payload.meta.request_id,
    //       'Content-type': 'application/json',
    //     },
    //     body: JSON.stringify(data),
    //   }
    // );

    // if (response.status === 200) {
    //   this.log(
    //     'debug',
    //     mdataMessage,
    //     response,
    //     'success_gambit_proxy_response_200'
    //   );
    //   return true;
    // }

    // if (response.status === 422) {
    //   this.log(
    //     'warning',
    //     mdataMessage,
    //     response,
    //     'error_gambit_proxy_response_422'
    //   );
    //   return false;
    // }


    // this.log(
    //   'warning',
    //   mdataMessage,
    //   response,
    //   'error_gambit_proxy_response_not_200_retry'
    // );

    // throw new BlinkRetryError(
    //   `${response.status} ${response.statusText}`,
    //   mdataMessage
    // );
  }

  async log(level, message, response, code = 'unexpected_code') {
  //   const cleanedBody = (await response.text()).replace(/\n/g, '\\n');

  //   const meta = {
  //     env: this.blink.config.app.env,
  //     code,
  //     worker: this.constructor.name,
  //     request_id: message ? message.payload.meta.request_id : 'not_parsed',
  //     response_status: response.status,
  //     response_status_text: `"${response.statusText}"`,
  //   };
  //   // Todo: log error?
  //   logger.log(level, cleanedBody, meta);
  }
}

module.exports = CustomerIoUpdateCustomerWorker;
