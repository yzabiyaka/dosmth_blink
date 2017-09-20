'use strict';

const CustomerIoTrackEventWorker = require('./CustomerIoTrackEventWorker');

class CustomerIoCampaignSignupEventWorker extends CustomerIoTrackEventWorker {
  setup() {
    this.queue = this.blink.queues.customerIoCampaignSignupQ;
    this.eventName = 'track_campaign_signup';
  }
}

module.exports = CustomerIoCampaignSignupEventWorker;
