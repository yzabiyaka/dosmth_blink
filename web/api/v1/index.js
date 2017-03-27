'use strict';

/**
 * Imports.
 */
const express = require('express');

/**
 * Dependencies initializations.
 */
const router = express.Router();

/**
 * Routing.
 */
// V1 Root
router.get('/', (req, res) => {
  res.json({});
});

module.exports = router;
