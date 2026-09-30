import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const ALLOWED_TAGS = new Set(['settings', 'projects', 'services', 'testimonials', 'skills', 'experience', 'gallery']);

/**
 * POST /api/revalidate { tags: string[] }
 * Clears cached public data after an admin edit. Only a valid admin session may call it, and only
 * from this site (same-origin check against CSRF).
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Origin not allowed' } }, { status: 403 });
  }

  const session = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
    headers: {
      Cookie: request.headers.get('cookie') ?? '',
      ...(process.env.INTERNAL_API_KEY ? { 'x-internal-key': process.env.INTERNAL_API_KEY } : {}),
    },
    cache: 'no-store',
  }).catch(() => null);
  if (!session?.ok) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string' && ALLOWED_TAGS.has(tag)) : [];

  // expire: 0 → the next visitor gets fresh data instead of a stale copy.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ data: { revalidated: tags } }, { headers: { 'Cache-Control': 'no-store' } });
}
