'use strict';

// ------- Imports -------------------------------------------------------------

const AMQPChannel = require('amqplib/lib/channel_model').Channel;
const AMQPConnection = require('amqplib/lib/connection').Connection;
const Chance = require('chance');
const net = require('net');

const RabbitMQBroker = require('../../src/lib/brokers/RabbitMQ/RabbitMQBroker');
const Queue = require('../../src/lib/Queue');
const FreeFormMessage = require('../../src/messages/FreeFormMessage');

// ------- Init ----------------------------------------------------------------

const chance = new Chance();

// ------- Helpers -------------------------------------------------------------

class UnitHooksHelper {
  static createRandomQueueInMemory(t) {
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

  static createFakeAmqpChannel(t) {
    const socket = new net.Socket();
    const connection = new AMQPConnection(socket);
    t.context.amqpChannel = new AMQPChannel(connection);
  }

  static destroyFakeAmqpChannel(t) {
    t.context.amqpChannel = false;
  }
}

module.exports = UnitHooksHelper;

// ------- End -----------------------------------------------------------------
