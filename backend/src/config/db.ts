import mongoose from 'mongoose';
import { logger } from './logger';

// Strip `$`-prefixed operators from query filters built from user input (NoSQL injection guard).
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  logger.info('MongoDB connected');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
