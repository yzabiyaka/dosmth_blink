'use strict';

const Joi = require('joi');
const uuidV4 = require('uuid/v4');

const MessageParsingBlinkError = require('../errors/MessageParsingBlinkError');
const MessageValidationBlinkError = require('../errors/MessageValidationBlinkError');

class Message {
  constructor({ data = {}, meta = {} }) {
    this.payload = { data, meta };
    // Generate unique message id or reuse request id.
    this.payload.meta.request_id = this.payload.meta.request_id || uuidV4();
    // Automatically set retryAttempt to 0.
    if (!this.payload.meta.retryAttempt || this.payload.meta.retryAttempt < 1) {
      this.payload.meta.retryAttempt = 0;
    }

    // Bind public functions.
    this.getData = this.getData.bind(this);
    this.getMeta = this.getMeta.bind(this);
    this.getRequestId = this.getRequestId.bind(this);
    this.toString = this.toString.bind(this);
    this.validate = this.validate.bind(this);
    this.validateStrict = this.validateStrict.bind(this);
  }

  getData() {
    return this.payload.data;
  }

  getMeta() {
    return this.payload.meta;
  }

  getRequestId() {
    return this.payload.meta.request_id;
  }

  getRetryAttempt() {
    return this.payload.meta.retryAttempt || 0;
  }

  incrementRetryAttempt(reason) {
    this.payload.meta.retryAttempt = this.getRetryAttempt() + 1;
    if (reason) {
      this.payload.meta.retryReason = reason;
    }
    return this.payload.meta.retryAttempt;
  }

  toString() {
    return JSON.stringify(this.payload);
  }

  validate() {
    const { error } = Joi.validate(this.getData(), this.schema || {});
    if (error) {
      throw new MessageValidationBlinkError(error.message, this.toString());
    }
    return true;
  }

  validateStrict() {
    const { error, value } = Joi.validate(
      this.getData(),
      this.schema || {},
      {
        stripUnknown: true,
      },
    );
    if (error) {
      throw new MessageValidationBlinkError(error.message, this.toString());
    }
    this.payload.data = value;
    return true;
  }

  static fromCtx(ctx) {
    const messageData = {
      data: ctx.request.body,
      meta: {
        // TODO: save more metadata/
        request_id: ctx.id,
      },
    };
    return this.heuristicMessageFactory(messageData);
  }

  static fromRabbitMessage(rabbitMessage) {
    const payload = this.unpackRabbitMessage(rabbitMessage);
    if (!payload.data || !payload.meta) {
      throw new MessageParsingBlinkError('No data in message', payload);
    }

    const messageData = {
      data: payload.data,
      meta: payload.meta,
    };
    const message = this.heuristicMessageFactory(messageData);
    // Required to be compatible with RabbitMQ.
    // See RabbitMQBroker.ack() note.
    // TODO: make this method independent from RabbitMQ specifics..
    message.fields = rabbitMessage.fields;
    return message;
  }

  static heuristicMessageFactory(messageData = {}) {
    return new this.prototype.constructor(messageData);
  }

  static unpackRabbitMessage(incomingMessage) {
    let payload = false;
    const rawPayload = incomingMessage.content.toString();
    try {
      payload = JSON.parse(rawPayload);
    } catch (error) {
      throw new MessageParsingBlinkError(error, rawPayload);
    }
    return payload;
  }
}

module.exports = Message;
