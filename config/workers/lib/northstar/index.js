'use strict';

module.exports = {
  baseUri: process.env.DS_NORTHSTAR_API_BASEURI,
  // TODO: use to throttle requests to the NS API
  userUpdateSpeedLimit: process.env.DS_NORTHSTAR_API_USER_UPDATE_SPEED_LIMIT || 10,
  authStrategies: {
    clientCredentials: {
      defaults: {
        tickerInterval: 1000, // milliseconds
        reconnectWaitPeriod: 10000, // milliseconds
        autoRenewToken: true,
        renewWindow: 60, // seconds
      },
      /**
       * admin write - required to create signups with client credentials flow, otherwise signups
       *               will be created with an empty northstar_id. This is an edgecase that the
       *               Rogue team is already aware of.
       * activity    - required to retrieve user's signup activity.
       */
      scopes: process.env.DS_NORTHSTAR_API_OAUTH_SCOPES,
      /**
       * @see https://www.npmjs.com/package/simple-oauth2#options
       */
      credentials: {
        client: {
          id: process.env.DS_NORTHSTAR_API_OAUTH_CLIENT_ID,
          secret: process.env.DS_NORTHSTAR_API_OAUTH_CLIENT_SECRET,
        },
        auth: {
          tokenHost: process.env.DS_NORTHSTAR_API_OAUTH_TOKEN_HOST,
          tokenPath: process.env.DS_NORTHSTAR_API_OAUTH_TOKEN_PATH,
        },
        options: {
          bodyFormat: 'json',
        },
      },
    },
  },
};
