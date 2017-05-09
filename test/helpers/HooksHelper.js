'use strict';

// libraries
const supertest = require('supertest');
const faker = require('faker');
const underscore = require('underscore');

// App modules
const BlinkWebApp = require('../../src/app/BlinkWebApp');
const UserMessage = require('../../src/messages/UserMessage');

class HooksHelper {

  static async startBlinkWebApp(t) {
    t.context.config = require('../../config');
    t.context.blink = new BlinkWebApp(t.context.config);
    await t.context.blink.start();
    t.context.supertest = supertest(t.context.blink.web.app.callback());
  }

  static async stopBlinkWebApp(t) {
    await t.context.blink.stop();
    t.context.supertest = false;
    t.context.config = false;
  }

  static buildValidUserMessage(t) {
    const bDay = faker.date.past();
    const fakeId = `57d1aa6142a06${Date.now().toString(16)}`;
    const roles = ['user', 'admin', 'staff'];
    const sources = ['niche', 'phoenix', 'after_school'];
    const mobileStatuses = ['undeliverable', 'active', 'unknown'];

    t.context.user = new UserMessage({
      data: {
        id: fakeId,
        _id: fakeId,
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        last_initial: '',
        photo: faker.image.imageUrl(),
        email: faker.internet.email(),
        mobile: null,
        facebook_id: faker.random.number(4091040),
        interests: [
          faker.random.word(),
          faker.random.word(),
        ],
        birthdate: `${bDay.getFullYear()}-${bDay.getMonth()}-${bDay.getDate()}`,
        addr_street1: faker.address.streetAddress(),
        addr_street2: faker.address.secondaryAddress(),
        addr_city: faker.address.city(3),
        addr_state: faker.address.state(),
        addr_zip: faker.address.zipCode('#####'),
        source: underscore.sample(sources),
        source_detail: faker.random.word(),
        slack_id: faker.random.number(4091040),
        mobilecommons_id: faker.random.number(167181555),
        parse_installation_ids: null,
        mobile_status: underscore.sample(mobileStatuses),
        language: faker.random.locale(),
        country: faker.address.countryCode(),
        drupal_id: faker.random.number(4091040),
        role: underscore.sample(roles),
        last_authenticated_at: faker.date.past(),
        updated_at: faker.date.past(),
        created_at: faker.date.past(),
      },
      meta: {},
    });
  }

  static clearValidUserMessage(t) {
    delete t.context.user;
  }

}

module.exports = HooksHelper;
