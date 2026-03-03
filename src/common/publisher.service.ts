import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  connect,
  AmqpConnectionManager,
  ChannelWrapper,
} from 'amqp-connection-manager';
import { envs } from '../config/envs';

@Injectable()
export class PublisherService implements OnModuleInit, OnModuleDestroy {
  private conn: AmqpConnectionManager;
  private channel: ChannelWrapper;
  private readonly exchange = 'riff_events';
  private readonly logger = new Logger(PublisherService.name);

  async onModuleInit() {
    this.conn = connect([envs.rabbitUrl]);
    this.channel = this.conn.createChannel({
      json: false,
      setup: (channel) =>
        Promise.all([
          channel.assertExchange(this.exchange, 'topic', { durable: true }),
        ]),
    });

    this.logger.log(`PublisherService connected to exchange ${this.exchange}`);
  }

  async publish(routingKey: string, payload: unknown) {
    const content = Buffer.from(JSON.stringify(payload));
    try {
      await this.channel.publish(this.exchange, routingKey, content, {
        persistent: true,
      });
    } catch (err) {
      this.logger.error('Failed to publish message', err);
      throw err;
    }
  }

  onModuleDestroy() {
    try {
      this.conn?.close();
    } catch (err) {
      this.logger.warn('Error closing RabbitMQ connection');
    }
  }
}
