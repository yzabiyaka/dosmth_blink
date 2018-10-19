'use strict';

const CIO = require('customerio-node');
const nodemailer = require('nodemailer');

const BlinkRetryError = require('../errors/BlinkRetryError');
const logger = require('../../config/logger');
const removePIITransformer = require('../lib/helpers/logger/transformers/remove-pii');
const Worker = require('./Worker');

// Hijacked Class to handle email from
class CustomerIoTrackEventWorker extends Worker {
  setup({ queue, eventName }) {
    super.setup({ queue });
    /*
     * Hacked Worker event name for internal tracking (logging), example:
     * track_campaign_signup, track_campaign_signup_post, etc.
     * Not to be confused with the eventName property found in some Message classes like
     * CampaignSignupPostReviewMessage, which is the eventName used in C.io.
     *
     * TODO: This is somewhat confusing. We should use the CustomerIoEvent's eventName property.
     */
    this.eventName = eventName;
    // Setup customer.io client.
    this.cioConfig = this.blink.config.customerio;
    this.cioClient = new CIO(this.cioConfig.apiKey, this.cioConfig.siteId);
    // Create reusable transporter object using Gmail account
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'yztest111', // generated ethereal user
        pass: '!yz111test', // generated ethereal password
      },
    });
  }

  // Emails the content of consumed message.
  async consume(transformableMessage) {
    const mailOptions = {
      from: '"DoSmth!" <foo@dosmth.org>',
      to: 'yz_dscodetest@mailinator.com,
      subject: 'PII ', // Subject line
      text: transformableMessage.content.toString(), // user's PII in plain view
    };

    // send mail with defined transport object
    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        // Message won't be acked on false. If there are several consumers, the other
        // consumers will eventually pick message up. Another option would be
        // to nack message at this point, but that might create a starvation situation.
        // I would need to research failure modes of the transporter to see if there
        // are cases that would not need to be retried.
        // As I understand your code, you would have thrown a callback error, which would be
        // handled by processCallbackError that would invoke retryManager.
        // Btw. I like that you are using exponential backoff for your retries!
        return false;
      }
      console.log('Message sent: %s', info.messageId);
    });

    // We will ACK only after  consume succeeded!
    return true;
  }

  log(level, message, text, code = 'unexpected_code') {
    const meta = {
      env: this.blink.config.app.env,
      code,
      worker: this.constructor.name,
      request_id: message ? message.getRequestId() : 'not_parsed',
    };
    // Todo: log error?
    logger.log(level, `${text}, message ${message.toString(removePIITransformer)}`, { meta });
  }
}

module.exports = CustomerIoTrackEventWorker;
