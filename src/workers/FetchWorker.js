'use strict';

const logger = require('winston');

const Worker = require('./Worker');

class FetchWorker extends Worker {

  constructor(blink) {
    super(blink);
    this.blink = blink;

    // Bind process method to queue context
    this.consume = this.consume.bind(this);
  }

  setup() {
    this.queue = this.blink.queues.fetchQ;
  }

  async consume(fetchMessage) {
    const { url, options } = fetchMessage.payload.data;
    const response = await fetch(url, options);
    this.log(
      'debug',
      fetchMessage,
      response,
      'success_fetch_performed'
    )
  }

  async log(level, message, response, code = 'unexpected_code') {
    const cleanedBody = (await response.text()).replace(/\n/g, '\\n');;

    const meta = {
      // Todo: log env
      worker: this.constructor.name,
      request_id: message ? message.payload.meta.request_id : 'not_parsed',
      message: message ? `'${message.toString()}'` : 'not_parsed',
      response_status: `"${response.status} ${response.statusText}"`,
      code,
    };
    // Todo: log error?

    logger.log(level, cleanedBody, meta);
  }
}

module.exports = FetchWorker;
