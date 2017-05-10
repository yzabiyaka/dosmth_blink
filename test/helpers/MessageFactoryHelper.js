'use strict';

// ------- Imports -------------------------------------------------------------

// Libraries
const Chance = require('chance');
const moment = require('moment');

// App modules
const UserMessage = require('../../src/messages/UserMessage');

// ------- Init ----------------------------------------------------------------

const chance = new Chance();

// ------- Helpers -------------------------------------------------------------

class MessageFactoryHelper {

  static getValidUser() {
    const fakeId = chance.hash({ length: 24 });
    return new UserMessage({
      data: {
        id: fakeId,
        _id: fakeId,
        first_name: chance.first(),
        last_name: chance.last(),
        last_initial: chance.character({ alpha: true }),
        photo: chance.url({ extensions: ['gif', 'jpg', 'png'] }),
        email: chance.email(),
        mobile: `+1555${chance.string({ length: 7, pool: '1234567890' })}`,
        facebook_id: chance.fbid(),
        interests: chance.n(chance.word, 5),
        birthdate: moment(chance.birthday({ type: 'teen' })).format('YYYY-MM-DD'),
        addr_street1: chance.address(),
        addr_street2: `Apt ${chance.natural({ min: 1, max: 20 })}`,
        addr_city: chance.city(),
        addr_state: chance.state({ territories: true }),
        addr_zip: chance.zip(),
        source: chance.pickone(['niche', 'phoenix', 'after_school']),
        source_detail: chance.word(),
        slack_id: chance.natural().toString(),
        mobilecommons_id: chance.natural().toString(),
        parse_installation_ids: chance.n(chance.guid, 2),
        mobile_status: chance.pickone(['undeliverable', 'active', 'unknown']),
        language: chance.locale({ region: false }),
        country: chance.country(),
        drupal_id: chance.natural().toString(),
        role: chance.pickone(['user', 'admin', 'staff']),
        // Dates are arbitrary, but it's make more sense when they are within
        // different ranges.
        last_authenticated_at: chance.date({
          year: chance.year({ min: 2013, max: 2015 }),
        }).toISOString(),
        updated_at: chance.date({ year: chance.year({ min: 2011, max: 2012 }) }).toISOString(),
        created_at: chance.date({ year: chance.year({ min: 2000, max: 2010 }) }).toISOString(),
      },
      meta: {},
    });
  }

}

module.exports = MessageFactoryHelper;

// ------- End -----------------------------------------------------------------
