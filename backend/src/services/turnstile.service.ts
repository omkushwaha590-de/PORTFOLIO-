import { env, isProduction } from '../config/env';
import { logger } from '../config/logger';
import { AppError } from '../utils/app-error';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

if (!env.TURNSTILE_SECRET_KEY && isProduction) {
  logger.warn('TURNSTILE_SECRET_KEY is not set — public forms have no bot protection beyond rate limiting');
}

/** Verifies a Cloudflare Turnstile token. No-op when Turnstile is not configured. */
export async function verifyTurnstile(token: string | undefined, remoteIp?: string): Promise<void> {
  if (!env.TURNSTILE_SECRET_KEY) return;
  if (!token) throw AppError.badRequest('Bot verification is required');

  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const response = await fetch(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(8_000) });
    const result = (await response.json()) as { success?: boolean };
    if (!result.success) throw AppError.badRequest('Bot verification failed, please try again');
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error({ err }, 'Turnstile verification request failed');
    throw new AppError(503, 'Verification service unavailable, please try again', 'SERVICE_UNAVAILABLE');
  }
}
