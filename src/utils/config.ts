import { configType } from '../types/config';
import dotenv from "dotenv"

dotenv.config()

const config: configType = {
  PORT: Number(process.env.PORT ?? 3006),
  API_GATEWAY_URL: process.env.API_GATEWAY_URL ?? "http://localhost:3001",
  INTERNAL_SECRET: process.env.INTERNAL_SECRET ?? '',
  RABBITMQ_URL:
    process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq_test:5672',
};

export { config };
