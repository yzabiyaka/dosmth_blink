'use strict';

const Joi = require('joi');

const Message = require('./Message');

class CustomerIoIdentifyMessage extends Message {

  constructor(...args) {
    super(...args);
    // Data validation rules.
    // TODO: move to helpers.
    const whenNullOrEmpty = Joi.valid(['', null]);
    const optionalStringDefaultsToUndefined = Joi.string().empty(whenNullOrEmpty).default(undefined);
    const optionalDateDefaultsToUndefined = Joi.string().isoDate().empty(whenNullOrEmpty).default(undefined);

    this.schema = Joi.object().keys({
      id: Joi.string().required().regex(/^[0-9a-f]{24}$/, 'valid object id'),
      data: Joi.object().keys({
        // Remove field when provided as empty string or null.
        email: Joi.string().empty(whenNullOrEmpty).default(undefined),
        mobile: Joi.string().empty(whenNullOrEmpty).default(undefined),

        // Required:
        updated_at: Joi.string().required().isoDate(),
        created_at: Joi.string().required().isoDate(),

        mobile_status: Joi.valid([
          'active',
          'undeliverable',
          'unknown',
          null,
        ]).default(undefined),

        // Optional, defaults to null when provided as empty string or null.
        last_authenticated_at: optionalDateDefaultsToUndefined,
        birthdate: optionalDateDefaultsToUndefined,
        first_name: optionalStringDefaultsToUndefined,
        last_name: optionalStringDefaultsToUndefined,
        addr_city: optionalStringDefaultsToUndefined,
        addr_state: optionalStringDefaultsToUndefined,
        addr_zip: optionalStringDefaultsToUndefined,
        source: optionalStringDefaultsToUndefined,
        source_detail: optionalStringDefaultsToUndefined,
        language: optionalStringDefaultsToUndefined,
        country: optionalStringDefaultsToUndefined,

              // Allow anything as a role, but default to user.
        role: Joi.string().empty(whenNullOrEmpty).default('user'),

        // When interests not present, make them an empty array.
        interests: Joi.array().items(Joi.string()).empty(null).default(undefined),

        // TODO: add cio specific fields, like unsubscribe
      })
      .or('email', 'mobile'),
  })
  // Require presence at least one of: keyword, args, mms_image_url.
  }

  static fromUser(userMessage) {
    const user = userMessage.payload.data;
    // Copy user fields.
    const customerData = Object.assign({}, user);
    // Remove id
    delete customerData.id;

    // Rename mobilecommon_status to mobile_status
    if (customerData.mobilecommon_status) {
      const mobile_status = customerData.mobilecommon_status;
      delete customerData.mobilecommon_status;
      customerData.mobile_status = mobile_status;
    }

    const customerIoIdentifyMessage = new CustomerIoIdentifyMessage({
      data: {
        id: user.id,
        data: customerData,
      },
      meta: {
        request_id: userMessage.payload.meta.request_id,
      },
    });
    return customerIoIdentifyMessage;
  }

}

module.exports = CustomerIoIdentifyMessage;
