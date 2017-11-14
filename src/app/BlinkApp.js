'use strict';

const changeCase = require('change-case');
const logger = require('winston');

// const Exchange = require('../lib/Exchange');
const ReconnectManager = require('../lib/ReconnectManager');
const Channel = require('../lib/Channel');
const Connection = require('../lib/Connection');

const CustomerIoCampaignSignupPostQ = require('../queues/CustomerIoCampaignSignupPostQ');
const CustomerIoCampaignSignupQ = require('../queues/CustomerIoCampaignSignupQ');
const CustomerioSmsBroadcastRelayQ = require('../queues/CustomerioSmsBroadcastRelayQ');
const CustomerIoUpdateCustomerQ = require('../queues/CustomerIoUpdateCustomerQ');
const FetchQ = require('../queues/FetchQ');
const GambitCampaignSignupRelayQ = require('../queues/GambitCampaignSignupRelayQ');
const QuasarCustomerIoEmailActivityQ = require('../queues/QuasarCustomerIoEmailActivityQ');
const TwilioSmsBroadcastGambitRelayQ = require('../queues/TwilioSmsBroadcastGambitRelayQ');
const TwilioSmsInboundGambitRelayQ = require('../queues/TwilioSmsInboundGambitRelayQ');

class BlinkApp {
  constructor(config) {
    this.config = config;
    this.queues = [];

    // Attach functions to object context.
    this.channel = channel;
    this.start = this.start.bind(this);
    this.reconnect = this.reconnect.bind(this);
  }

  async start() {
    return this.reconnect();
  }

  async reconnect() {
    if (this.connected || this.connecting) {
      return false;
    }

    // Block other attempts to reconnect when in progress.
    this.connecting = true;
    try {
      // Initialize and setup connection.
      this.channel = await this.setupChannel();

      // Initialize and setup all available queues.
      this.queues = await this.setupQueues([
        CustomerIoCampaignSignupPostQ,
        CustomerIoCampaignSignupQ,
        CustomerioSmsBroadcastRelayQ,
        CustomerIoUpdateCustomerQ,
        FetchQ,
        GambitCampaignSignupRelayQ,
        QuasarCustomerIoEmailActivityQ,
        TwilioSmsBroadcastGambitRelayQ,
        TwilioSmsInboundGambitRelayQ,
      ]);
    } catch (error) {
      this.connecting = false;
      this.scheduleReconnect(
        this.reconnectTimeout,
        'blink_bootstrap_error',
        `Blink bootrstrap failed: ${error}`,
      );
      return false;
    }

    this.connecting = false;
    this.connected = true;
    return true;
  }

  async stop() {
    // TODO: log.
    this.queues = [];
    this.channel.stop();
    return true;
  }

  async setupChannel() {
    const reconnectManager = new ReconnectManager();

    // Optional: tag connection for easier debug.
    const appData = {
      // TODO: add dyno name.
      name: this.config.app.name,
      version: this.config.app.version,
      env: this.config.app.env,
    };

    const connection = new Connection(this.config.amqp);
    await connection.reconnect();
    connection.enableAutoReconnect(reconnectManager);

    const channel = new Channel(connection);
    await channel.reconnect();
    channel.enableAutoReconnect(reconnectManager);
    this.channel = channel;
  }

  async setupQueues(queueClasses) {
    const queueMappingPromises = queueClasses.map(async (queueClass, i) => {
      const queue = new queueClasses[i](this.channel);
      // Assert Rabbit Topology.
      await queue.setup();
      const mappingKey = changeCase.camelCase(queueClass.name);
      // Return an item of 2D array for further transformation.
      return [mappingKey, queue];
    });

    // Wait for all queues to be set.
    const queueMappingArray = await Promise.all(queueMappingPromises);

    // Transform resolved promises array to an object.
    const queueMapping = {};
    queueMappingArray.forEach((mapping) => {
      const [key, value] = mapping;
      queueMapping[key] = value;
    });
    return queueMapping;
  }
}

module.exports = BlinkApp;
