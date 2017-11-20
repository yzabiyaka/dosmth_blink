'use strict';

// Imports.
const changeCase = require('change-case');

// Blink Libs.
const RabbitMQBroker = require('../lib/brokers/RabbitMQ/RabbitMQBroker');

// Queues:
// TODO: Register from microapps. See discoverQueueClasses().
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
    this.broker = false;

    // Attach external function to object context.
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  async start() {
    // Setup connection to message broker server.
    this.broker = await this.setupBroker();

    // Assert queues and add them to queue registry.
    // this.queues = await this.setupQueues(BlinkApp.discoverQueueClasses());

    // TODO: Error handling?
    return true;
    // return this.reconnect();
  }

  async stop() {
    // TODO: log.
    // Flush queues.
    this.queues = [];
    await this.broker.disconnect();
    return true;
  }

  async setupBroker() {
    // Optional: tag connection for easier debug.
    const clientDescription = {
      // TODO: add dyno name.
      name: this.config.app.name,
      version: this.config.app.version,
      env: this.config.app.env,
    };

    // Now only RabbitMQ is supported.
    const broker = new RabbitMQBroker(this.config.amqp, clientDescription);
    // Establish connection or perform authorization.
    const result = await broker.connect();
    // Return connected broker.
    return broker;
  }

  async setupQueues(queueClasses) {
    // TODO: This is too confusing. KISS.
    const queueMappingPromises = queueClasses.map(async (queueClass, i) => {
      // It's not possible to just say `new queueClass()`, JS would think
      // we're trying to construct class called 'queueClass'.
      // To construct a class dynamically, it's possible `new` its reference
      // stored as an array element: `new queueClasses[i]`.
      const queue = new queueClasses[i](this.broker);
      // Create queue if not already present in broker.
      await queue.assert();
      // Registry key makes it more convenient to get queues from the
      // registry using Node's object destructing:
      // const { fetchQ } = this.blink.queues;
      const registryKey = BlinkApp.generateQueueRegistryKey(queueClass);
      // Return an item of 2D array for further transformation.
      return [registryKey, queue];
    });

    // Wait for all queues to be asserted.
    const queueRegistryArray = await Promise.all(queueMappingPromises);

    // Transform resolved promises array to an object.
    // TODO: Again, too confusing, KISS.
    const queueRegistry = {};
    queueRegistryArray.forEach((mapping) => {
      const [key, value] = mapping;
      queueRegistry[key] = value;
    });
    return queueRegistry;
  }

  static discoverQueueClasses() {
    // TODO: register them from workers, bottom-up approach.
    return [
      CustomerIoCampaignSignupPostQ,
      CustomerIoCampaignSignupQ,
      CustomerioSmsBroadcastRelayQ,
      CustomerIoUpdateCustomerQ,
      FetchQ,
      GambitCampaignSignupRelayQ,
      QuasarCustomerIoEmailActivityQ,
      TwilioSmsBroadcastGambitRelayQ,
      TwilioSmsInboundGambitRelayQ,
    ];
  }

  static generateQueueRegistryKey(queueClass) {
    return changeCase.camelCase(queueClass.name);
  }

  // async reconnect() {
  //   if (this.connected || this.connecting) {
  //     return false;
  //   }

  //   // Block other attempts to reconnect when in progress.
  //   this.connecting = true;
  //   try {
  //     // Initialize and setup connection.
  //     this.channel = await this.setupChannel();

  //     // Initialize and setup all available queues.
  //     this.queues = await this.setupQueues();
  //   } catch (error) {
  //     this.connecting = false;
  //     this.scheduleReconnect(
  //       this.reconnectTimeout,
  //       'blink_bootstrap_error',
  //       `Blink bootrstrap failed: ${error}`,
  //     );
  //     return false;
  //   }

  //   this.connecting = false;
  //   this.connected = true;
  //   return true;
  // }
}

module.exports = BlinkApp;
