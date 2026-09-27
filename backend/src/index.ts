/**
 * Serverless entry point (Vercel detects `src/index.ts` and uses its default export).
 * Each function instance reuses one MongoDB connection across invocations.
 * For a long-running server (local, VPS, Render…) use `src/start.ts` instead.
 */
import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db';
import { env } from './config/env';
import { createApp } from './create-app';
import { bootstrap } from './scripts/bootstrap';

let connecting: Promise<void> | null = null;

/** Connects once per function instance, then runs first-start setup (see scripts/bootstrap.ts). */
const ensureDatabase: RequestHandler = async (_req, _res, next) => {
  if (mongoose.connection.readyState !== 1) {
    connecting ??= connectDatabase(env.MONGODB_URI)
      .then(() => bootstrap())
      .then(() => undefined)
      .catch((error: unknown) => {
        connecting = null; // allow the next request to retry
        throw error;
      });
  }
  if (connecting) await connecting;
  next();
};

const app = createApp({ beforeRoutes: ensureDatabase });

export default app;
