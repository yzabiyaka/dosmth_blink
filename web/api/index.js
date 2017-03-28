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
// API Root
router.get('/', async (ctx) => {
  ctx.body = {
    v1: '/api/v1',
  };
});

module.exports = router;
