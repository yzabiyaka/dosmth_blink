'use strict';

/**
 * Imports.
 */
const Router = require('koa-router');


/**
 * Dependencies initializations.
 */
const router = new Router();

/**
 * Routing.
 */
// V1 Root
router.get('/', async (ctx) => {
  ctx.body = {};
});

module.exports = router;
