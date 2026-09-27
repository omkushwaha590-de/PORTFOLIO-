import type { RequestHandler } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/app-error';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence-in-depth for cookie-authenticated requests (on top of SameSite cookies and CORS):
 * state-changing requests coming from a browser must originate from an allowed frontend origin.
 */
export const originCheck: RequestHandler = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (origin) {
    if (!env.CORS_ORIGINS.includes(origin.replace(/\/$/, ''))) throw AppError.forbidden('Origin not allowed');
    return next();
  }

  // No Origin header: allow non-browser clients, but reject browsers that report a cross-site request.
  if (req.get('sec-fetch-site') === 'cross-site') throw AppError.forbidden('Cross-site request blocked');
  next();
};
