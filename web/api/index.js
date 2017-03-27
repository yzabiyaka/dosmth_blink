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
// API Root
router.get('/', (req, res) => {
  res.json({
    v1: '/api/v1',
  });
});

module.exports = router;
