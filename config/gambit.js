
'use strict';

const config = {
  baseUrl: process.env.GAMBIT_API_BASE_URL || 'http://localhost:5000/v1',
  apiKey: process.env.GAMBIT_API_KEY || 'totallysecret',
  proxyConcurrency: parseInt(process.env.GAMBIT_PROXY_CONCURRENCY, 10) || 0,
};

module.exports = config;
