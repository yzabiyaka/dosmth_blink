'use strict';

const CampaignSignupPostMessage = require('./CampaignSignupPostMessage');

class CampaignSignupPostReviewMessage extends CampaignSignupPostMessage {
  constructor(...args) {
    super(...args);
    this.eventName = 'campaign_review';
  }
}

module.exports = CampaignSignupPostReviewMessage;
