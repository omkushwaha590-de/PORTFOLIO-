import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type RequestHandler } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { corsOptions } from './config/cors';
import { env, isProduction, isTest } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFound } from './middleware/error-handler';
import { originCheck } from './middleware/origin-check';
import { apiLimiter } from './middleware/rate-limit';
import { apiRouter } from './routes';
import { UPLOAD_DIR } from './services/storage.service';

const noStore: RequestHandler = (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};

export interface CreateAppOptions {
  /** Runs before the API routes, e.g. to ensure the database is connected on serverless platforms. */
  beforeRoutes?: RequestHandler;
}

export function createApp({ beforeRoutes }: CreateAppOptions = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  if (!isTest) app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/v1/health' } }));

  // Security headers. This server only returns JSON and images, so the CSP can be fully locked down.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'none'"], formAction: ["'none'"] },
      },
      // Allow the frontend (another origin) to display uploaded images.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      strictTransportSecurity: isProduction ? { maxAge: 63_072_000, includeSubDomains: true, preload: true } : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.use((_req, res, next) => {
    res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
    next();
  });

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '200kb' }));
  app.use(cookieParser());

  if (env.STORAGE_DRIVER === 'local') {
    app.use(
      '/uploads',
      express.static(UPLOAD_DIR, { index: false, dotfiles: 'deny', fallthrough: false, maxAge: '30d', immutable: true }),
    );
  }

  if (beforeRoutes) app.use('/api/v1', beforeRoutes);
  app.use('/api/v1', apiLimiter, originCheck);
  app.use(['/api/v1/admin', '/api/v1/auth'], noStore);
  app.use('/api/v1', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
