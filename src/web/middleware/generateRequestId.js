'use strict';

const uuidV4 = require('uuid/v4');

const generateRequestId = async function (ctx, next) {
  ctx.id = ctx.id || uuidV4();
  await next();
  ctx.set('X-Request-Id', ctx.id);
};

module.exports = generateRequestId;
