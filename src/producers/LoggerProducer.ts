import amqp, { Channel, ChannelModel } from 'amqplib';

import { config } from '../utils/config';

const QUEUE = 'create_log_queue';

export class LoggerProducer {
  private connection?: ChannelModel;
  private channel?: Channel;

  async connect() {
    if (this.connection && this.channel) return;

    this.connection = await amqp.connect(config.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(QUEUE, { durable: true });

    // eslint-disable-next-line no-console
    console.log('LoggerProducer connecté à RabbitMQ');
  }

  async publish(payload: unknown) {
    await this.connect();
    // eslint-disable-next-line no-console
    console.log('Publication du message de log:', payload);
    if (this.channel)
      this.channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
      });
  }

  async close() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
