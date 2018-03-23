'use strict';

const fetch = require('node-fetch');
/**
 * Deep Extend is used because Object.assign does shallow-copy only. Nested objects are
 * referenced instead of copied which can bring unintended consequences.
 */
const deepExtend = require('deep-extend');

const gambitConfig = require('../../../config/gambit');

/**
 * getMessageIdBySidPath
 *
 * @param  {string} messageSid
 * @return {string}             path
 */
module.exports.getMessageIdBySidPath = function getMessageIdBySidPath(messageSid) {
  return `messages?query={"platformMessageId":"${messageSid}"}&select=id&limit=1`;
};


/**
 * getUpdateMessagePath
 *
 * @param  {string} messageId
 * @return {string}           path
 */
module.exports.getUpdateMessagePath = function getUpdateMessagePath(messageId) {
  return `messages/${messageId}`;
};

/**
 * get - Sends a GET requests to the v1MessagesBaseURL host and given path
 *
 * @async
 * @param  {String} path
 * @param  {Object} opts = {}
 * @return {Promise}
 */
module.exports.executeGet = async function executeGet(path, opts = {}) {
  const options = Object.assign({}, deepExtend(opts, {
    method: 'GET',
  }));
  return fetch(`${gambitConfig.conversations.v1MessagesBaseURL}/${path}`, options);
};

/**
 * update - Sends a PATCH request to the baseURL host and given path
 *
 * @async
 * @param  {string} path
 * @param  {Object} opts = {}
 * @return {Promise}
 */
module.exports.executeUpdate = async function executeUpdate(path, opts = {}) {
  const options = Object.assign({}, deepExtend(opts, {
    method: 'PATCH',
  }));
  return fetch(`${gambitConfig.conversations.baseURL}/${path}`, options);
};

/**
 * getMessageIdBySid - Gets a message from Gambit Conversations by the messageSid.
 * The message contains an _id property when found.
 *
 * @async
 * @param  {string} messageSid
 * @param  {Object} opts
 * @return {Promise}
 */
module.exports.getMessageIdBySid = async function getMessageIdBySid(messageSid, opts) {
  // @see https://www.npmjs.com/package/express-restify-mongoose
  const path = exports.getMessageIdBySidPath(messageSid);
  return exports.executeGet(path, opts);
};

/**
 * updateMessage - Updates a message in Gambit Conversations by the messageId.
 *
 * @async
 * @param  {String} messageId
 * @param  {Object} opts
 * @return {Promise}
 */
module.exports.updateMessage = async function updateMessage(messageId, opts) {
  const path = exports.getUpdateMessagePath(messageId);
  return exports.executeUpdate(path, opts);
};

/**
 * getDeliveredAtUpdateBody
 *
 * @return {Object}  The metadata update to be sent to G-Conversations
 */
module.exports.getDeliveredAtUpdateBody = function getDeliveredAtUpdateBody(message) {
  return {
    metadata: {
      delivery: {
        deliveredAt: message.deliveredAt,
      },
    },
  };
};

/**
 * getFailedAtUpdateBody
 *
 * @return {Object}  The metadata update to be sent to G-Conversations
 */
module.exports.getFailedAtUpdateBody = function getFailedAtUpdateBody(message) {
  return {
    metadata: {
      delivery: {
        failedAt: message.failedAt,
        failureData: {
          code: message.ErrorCode,
          message: message.ErrorMessage,
        },
      },
    },
  };
};

/**
 * parseMessageIdFromBody - It parses the _id out of the given response body
 * from the G-Conversations v1/messages request.
 *
 *
 * WARNING: This method is coupled with G-Conversations implementation of the v1/messages route.
 * G-Conversations uses express-restify-mongoose, which sends the found tuples in an array.
 *
 * @param  {array} body description
 * @return {string}
 */
module.exports.parseMessageIdFromBody = function parseMessageIdFromBody(body) {
  if (!Array.isArray(body) || body.length <= 0) {
    throw new Error('parseMessageIdFromBody(): Non empty array expected in response');
  }
  return body[0]._id; // eslint-disable-line no-underscore-dangle
};
