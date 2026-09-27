import type { CorsOptions } from 'cors';
import { env } from './env';

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Same-origin and server-to-server requests (e.g. Next.js server components) send no Origin header.
    if (!origin || env.CORS_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  maxAge: 600,
};
