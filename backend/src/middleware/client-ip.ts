import type { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { env } from '../config/env';

/**
 * The frontend (Next.js) calls this API from its own servers, so the TCP peer is the frontend,
 * not the visitor. Requests carrying the shared INTERNAL_API_KEY are trusted:
 *  - with `x-client-ip`: a visitor's request relayed by the frontend proxy (rate-limited per visitor)
 *  - without it: the frontend server itself, e.g. rendering a page (not rate-limited)
 * Without a valid key, `x-client-ip` is ignored, so it cannot be spoofed.
 */
export function isInternal(req: Request): boolean {
  const provided = req.get('x-internal-key');
  if (!env.INTERNAL_API_KEY || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(env.INTERNAL_API_KEY);
  return a.length === b.length && timingSafeEqual(a, b);
}

const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

/** The visitor's IP address, as reliably as it can be determined. */
export function clientIp(req: Request): string {
  if (isInternal(req)) {
    const relayed = req.get('x-client-ip')?.trim();
    if (relayed && IP_PATTERN.test(relayed)) return relayed;
  }
  return req.ip ?? 'unknown';
}

/** Server-to-server call from the frontend with no visitor behind it. */
export function isInternalServerCall(req: Request): boolean {
  return isInternal(req) && !req.get('x-client-ip');
}
