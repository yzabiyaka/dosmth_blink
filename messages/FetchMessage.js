'use strict';

const Message = require('../lib/Message');

class FetchMessage extends Message {

  constructor(...args) {
    super(...args);

    // Data validation rules.
    this.constraints = {
      url: {
        presence: true,
      },
    };
  }

  static fromCtx(ctx) {
    const fetchMessage = new FetchMessage({
      data: ctx.request.body,
      meta: {
        request_id: ctx.request.id,
      },
    });
    return fetchMessage;
  }

}

module.exports = FetchMessage;
