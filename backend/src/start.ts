import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { logger } from './config/logger';
import { createApp } from './create-app';

async function main() {
  await connectDatabase(env.MONGODB_URI);

  const server = createApp().listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}/api/v1`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
