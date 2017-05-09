'use strict';

const supertest = require('supertest');

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
    t.context.user = new UserMessage({
      data: {
        id: '57d1aa6142a06448258b4572',
        _id: '57d1aa6142a06448258b4572',
        first_name: 'Sergii',
        last_name: '',
        last_initial: '',
        photo: null,
        email: 'sergii+test@dosomething.org',
        mobile: null,
        facebook_id: null,
        interests: [
          'basketball',
          'wwe',
        ],
        birthdate: '1996-05-28',
        addr_street1: null,
        addr_street2: null,
        addr_city: null,
        addr_state: null,
        addr_zip: '10001',
        source: 'phoenix',
        source_detail: null,
        slack_id: null,
        mobilecommons_id: '167181555',
        parse_installation_ids: null,
        mobilecommons_status: 'undeliverable',
        language: 'en',
        country: 'UA',
        drupal_id: '4091040',
        role: 'user',
        last_authenticated_at: '2017-04-25T18:51:28+00:00',
        updated_at: '2017-04-25T18:51:28+00:00',
        created_at: '2016-09-08T18:13:43+00:00',
      },
      meta: {}
    });
  }

  static clearValidUserMessage(t) {
    delete t.context.user;
  }

}

module.exports = HooksHelper;
