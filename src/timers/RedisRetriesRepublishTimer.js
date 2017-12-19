'use strict';

// const logger = require('winston');

const Timer = require('./Timer');

class RedisRetriesRepublishTimer extends Timer {
  constructor(blink) {
    super(blink);

    // Bind process method to queue context
    this.run = this.run.bind(this);
  }

  setup() {
    // Repeat inteval, ms.
    this.interval = 1000;
    this.redisClient = this.blink.redis.getClient();
    this.retrySet = this.blink.redis.retrySet;
    this.retrySetProcessLimit = this.blink.redis.retrySetProcessLimit;
  }

  async run() {
    const result = await this.redisClient.zrangebyscore(
      this.retrySet,
      0, // from 0
      1, // to date
      ['LIMIT', 0, this.retrySetProcessLimit],
    );
    console.dir(result, { colors: true, showHidden: true });
  }

  // async consume(fetchMessage) {
  //   const { url, options } = fetchMessage.getData();
  //   const response = await fetch(url, options);
  //   if (response.status === 200) {
  //     this.log(
  //       'debug',
  //       fetchMessage,
  //       response,
  //       'success_fetch_response_200',
  //     );
  //     return true;
  //   }

  //   // Todo: retry when 500?
  //   this.log(
  //     'warning',
  //     fetchMessage,
  //     response,
  //     'error_fetch_response_not_200',
  //   );
  //   return false;
  // }

  // async log(level, message, response, code = 'unexpected_code') {
  //   const cleanedBody = (await response.text()).replace(/\n/g, '\\n');

  //   const meta = {
  //     // Todo: log env
  //     code,
  //     worker: this.constructor.name,
  //     request_id: message ? message.getRequestId() : 'not_parsed',
  //     response_status: response.status,
  //     response_status_text: `"${response.statusText}"`,
  //   };
  //   // Todo: log error?

  //   logger.log(level, cleanedBody, meta);
  // }
}

module.exports = RedisRetriesRepublishTimer;
