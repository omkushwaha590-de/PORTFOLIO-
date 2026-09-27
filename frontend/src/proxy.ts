import { NextResponse, type NextRequest } from 'next/server';

/**
 * Per-request nonce-based Content-Security-Policy. Next.js reads the nonce from the request's CSP
 * header and applies it to its own scripts, so no inline script runs without it.
 */
const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

/**
 * Relays browser calls to /api/v1/* to the Express backend. The frontend's secret key and the
 * visitor's IP are attached so the backend can rate-limit per visitor; any copies of those headers
 * sent by the browser are removed first so they cannot be forged.
 */
function relayToBackend(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete('x-internal-key');
  headers.delete('x-client-ip');
  const key = process.env.INTERNAL_API_KEY;
  if (key) {
    headers.set('x-internal-key', key);
    // On Vercel, x-forwarded-for is set by the platform to the real client IP.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (ip) headers.set('x-client-ip', ip);
  }
  const target = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, BACKEND_URL);
  return NextResponse.rewrite(target, { request: { headers } });
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/v1/')) return relayToBackend(request);

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';
  const turnstile = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? ' https://challenges.cloudflare.com' : '';

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}${turnstile}`,
    // Inline style attributes are needed by animation libraries and next/image; styles cannot execute code.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://res.cloudinary.com https://*.public.blob.vercel-storage.com${isDev ? ' http://localhost:4000' : ''}`,
    `font-src 'self'`,
    `connect-src 'self'${isDev ? ' ws:' : ''}${turnstile}`,
    `frame-src 'self'${turnstile}`,
    `media-src 'self' https://res.cloudinary.com https://*.public.blob.vercel-storage.com`,
    `worker-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    '/api/v1/:path*',
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|icon|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
