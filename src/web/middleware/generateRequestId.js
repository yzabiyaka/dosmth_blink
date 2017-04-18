'use strict';

const uuidV4 = require('uuid/v4');

const generateRequestId = async function (ctx, next) {
  ctx.id = ctx.id || ctx.get('X-Request-ID') || uuidV4();
  await next();
  ctx.set('X-Request-ID', ctx.id);
};

module.exports = generateRequestId;
