'use strict';

// ------- Imports -------------------------------------------------------------

const Chance = require('chance');

const RabbitMQBroker = require('../../src/lib/brokers/RabbitMQ/RabbitMQBroker');
const Queue = require('../../src/lib/Queue');
const FreeFormMessage = require('../../src/messages/FreeFormMessage');

// ------- Init ----------------------------------------------------------------

const chance = new Chance();

// ------- Helpers -------------------------------------------------------------

class UnitHooksHelper {
  static async createRandomQueueInMemory(t) {
    const config = require('../../config');

    // Optional: tag connection for easier debug.
    const clientDescription = {
      name: `${config.app.name}-test-client`,
      version: config.app.version,
      env: config.app.env,
    };
    const broker = new RabbitMQBroker(config.amqp, clientDescription);

    const queue = new Queue(broker, `test-autogen-${chance.word()}-${chance.word()}`);
    queue.messageClass = FreeFormMessage;

    t.context.broker = broker;
    t.context.queue = queue;
  }

  static destroyRandomQueueInMemory(t) {
    t.context.queue = false;
    t.context.broker = false;
  }
}

module.exports = UnitHooksHelper;

// ------- End -----------------------------------------------------------------
