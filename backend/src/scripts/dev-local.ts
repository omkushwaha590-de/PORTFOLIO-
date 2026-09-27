/**
 * Local development without MongoDB Atlas: `npm run dev:local`
 * - runs a local MongoDB (data in %LOCALAPPDATA%/yogesh-portfolio/dev-db, outside synced folders)
 * - seeds the starter content on first run
 * - creates a development-only admin and writes its credentials to ./.dev-admin.txt (git-ignored)
 * Never use this in production.
 */
import { LOCAL_DB_PORT } from './dev-local.env'; // must stay the first import
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../create-app';
import { connectDatabase } from '../config/db';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { Admin } from '../models/admin.model';
import { hashPassword } from '../services/auth.service';
import { seedContent } from './seed-content';

async function main() {
  // Keep the database outside synced folders (OneDrive/Dropbox lock and rewrite the files while
  // MongoDB has them open, which makes it exit). Override with DEV_DB_PATH if needed.
  const dataRoot = process.env.LOCALAPPDATA ?? path.join(os.homedir(), '.local', 'share');
  const dbPath = process.env.DEV_DB_PATH ?? path.join(dataRoot, 'yogesh-portfolio', 'dev-db');
  mkdirSync(dbPath, { recursive: true });
  const mongo = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger', port: LOCAL_DB_PORT } });

  await connectDatabase(env.MONGODB_URI);
  // `npm run dev:local -- --reseed` replaces portfolio content with the latest seed data.
  (await seedContent({ force: process.argv.includes('--reseed') })).forEach((line) => logger.info(line));

  if ((await Admin.estimatedDocumentCount()) === 0) {
    const email = 'admin@portfolio.localhost';
    const password = `Dev-${randomBytes(12).toString('base64url')}-1a!`;
    await Admin.create({ email, name: 'Local Admin', passwordHash: await hashPassword(password) });
    writeFileSync(
      path.resolve(process.cwd(), '.dev-admin.txt'),
      `Local development admin (not for production)\nemail: ${email}\npassword: ${password}\n`,
    );
    logger.info('Created local admin — credentials saved in backend/.dev-admin.txt');
  }

  const server = createApp().listen(env.PORT, () => logger.info(`Local API on http://localhost:${env.PORT}/api/v1`));

  const shutdown = () => {
    server.close();
    void mongo.stop({ doCleanup: false }).then(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
