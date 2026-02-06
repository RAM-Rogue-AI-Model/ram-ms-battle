interface configType {
  PORT: number;
  INTERNAL_SECRET: string;
  API_GATEWAY_URL: string;
  RABBITMQ_URL: string;
  DATABASE_REDIS: string;
}

export { configType };
