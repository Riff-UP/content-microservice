/* eslint-disable no-console */
const amqp = require('amqplib');

async function setup() {
  const url = process.env.RABBIT_URL || 'amqp://guest:guest@localhost:5672';
  const exchange = 'riff_events';
  const queues = [
    { name: 'content_queue', bindings: ['post.created'] },
    {
      name: 'notifications_queue',
      bindings: [
        'post.created',
        'event.created',
        'event.updated',
        'event.cancelled',
      ],
    },
  ];

  const conn = await amqp.connect(url);
  const ch = await conn.createChannel();
  try {
    await ch.assertExchange(exchange, 'topic', { durable: true });
    console.log(`Exchange asserted: ${exchange}`);

    for (const q of queues) {
      await ch.assertQueue(q.name, { durable: true });
      console.log(`Queue asserted: ${q.name}`);
      for (const key of q.bindings) {
        await ch.bindQueue(q.name, exchange, key);
        console.log(`Bound ${q.name} to ${exchange} with ${key}`);
      }
    }

    console.log('RabbitMQ topology setup complete');
  } finally {
    await ch.close();
    await conn.close();
  }
}

setup().catch((err) => {
  console.error('Failed to setup RabbitMQ topology', err);
  process.exit(1);
});
