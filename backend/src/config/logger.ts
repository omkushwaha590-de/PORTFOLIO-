import pino from 'pino';
import { env, isProduction, isTest } from './env';

export const logger = pino({
  level: isTest ? 'silent' : isProduction ? 'info' : 'debug',
  // Never write credentials or cookies to logs.
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]', '*.password', '*.passwordHash'],
    censor: '[redacted]',
  },
  ...(env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } },
  }),
});
