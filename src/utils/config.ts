import { configType } from '../types/config';

const config: configType = {
  PORT: Number(process.env.PORT ?? 3006),
  INTERNAL_SECRET: process.env.INTERNAL_SECRET ?? '',
  RABBITMQ_URL: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
};

export { config };
