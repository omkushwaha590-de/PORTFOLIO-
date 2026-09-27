import 'server-only';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

/** Identifies this server to the backend (exempt from per-visitor rate limits). */
const INTERNAL_HEADERS: Record<string, string> = process.env.INTERNAL_API_KEY ? { 'x-internal-key': process.env.INTERNAL_API_KEY } : {};


export interface AdminUser {
  id: string;
  email: string;
  name: string;
  lastLoginAt: string | null;
}

/** Forwards the visitor's cookies so the backend can authenticate the admin session. */
async function cookieHeader(): Promise<string> {
  const store = await cookies();
  return store
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
}

async function backendGet(path: string): Promise<Response> {
  return fetch(`${BACKEND_URL}/api/v1${path}`, {
    headers: { Cookie: await cookieHeader(), Accept: 'application/json', ...INTERNAL_HEADERS },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
}

/** Current admin, or null. The backend is the source of truth (token + database check). */
export async function getAdmin(): Promise<AdminUser | null> {
  try {
    const response = await backendGet('/auth/me');
    if (!response.ok) return null;
    return ((await response.json()) as { data: AdminUser }).data;
  } catch {
    return null;
  }
}

/**
 * Loads admin data for a page. Every admin page calls this, so the session is verified on every
 * request and route change (layouts alone are not re-checked on client navigation).
 */
export async function adminGet<T, M = unknown>(path: string): Promise<{ data: T; meta?: M }> {
  const response = await backendGet(`/admin${path}`);
  if (response.status === 401) redirect('/admin/login');
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error(`Admin API ${path} responded ${response.status}`);
  return (await response.json()) as { data: T; meta?: M };
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

/** Server-side admin mutation (used e.g. to mark a message as read when it is opened). */
export async function adminPatch(path: string, body: unknown): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/v1/admin${path}`, {
    method: 'PATCH',
    headers: { Cookie: await cookieHeader(), 'Content-Type': 'application/json', ...INTERNAL_HEADERS },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (response.status === 401) redirect('/admin/login');
}
