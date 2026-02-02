import { LoggerProducer } from '../producers/LoggerProducer';

const loggerProducer = new LoggerProducer();

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
type EnemyAction = 'INSERT' | 'UPDATE' | 'REMOVE' | 'OTHER';

export async function sendLog(
  microservice: string,
  action: EnemyAction,
  level: LogLevel,
  message: string
) {
  try {
    await loggerProducer.publish({
      microservice,
      action,
      level,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Logger indisponible', err);
  }
}
