import rateLimit, { type Options } from 'express-rate-limit';
import { isTest } from '../config/env';
import { AppError } from '../utils/app-error';
import { clientIp, isInternalServerCall } from './client-ip';

function limiter(options: Partial<Options> & Pick<Options, 'windowMs' | 'limit'>) {
  return rateLimit({
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Count per visitor, not per frontend server; the frontend's own page renders are exempt.
    keyGenerator: (req) => clientIp(req),
    skip: (req) => isTest || isInternalServerCall(req),
    handler: (_req, _res, next, opts) => next(new AppError(429, String(opts.message), 'TOO_MANY_REQUESTS')),
    ...options,
  });
}

/** Baseline for the whole API. */
export const apiLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: 'Too many requests, please try again later',
});

/** Login: only failed attempts count, on top of the per-account lockout. */
export const loginLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
});

/** Public forms (contact, quote). */
export const formLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: 'Too many submissions, please try again later',
});
