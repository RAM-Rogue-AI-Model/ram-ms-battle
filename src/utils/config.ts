import dotenv from 'dotenv';

import { configType } from '../types/config';

dotenv.config();

const config: configType = {
  PORT: Number(process.env.PORT ?? 3006),
  API_GATEWAY_URL: process.env.API_GATEWAY_URL ?? 'http://localhost:3001',
  INTERNAL_SECRET: process.env.INTERNAL_SECRET ?? '',
  RABBITMQ_URL:
    process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq_test:5672',
  DATABASE_REDIS: process.env.DATABASE_REDIS ?? 'redis',
  DATABASE_REDIS_PORT: Number(process.env.DATABASE_REDIS_PORT ?? 6379),
};

export { config };
