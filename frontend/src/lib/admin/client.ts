import { ApiError } from '@/lib/api/client';
import type { ApiErrorBody } from '@/types/api';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

function toApiError(status: number, payload: ApiErrorBody | null): ApiError {
  const fieldErrors: Record<string, string> = {};
  const details = payload?.error.details;
  if (Array.isArray(details)) {
    for (const item of details as { path?: string; message?: string }[]) {
      if (item.path && item.message && !fieldErrors[item.path]) fieldErrors[item.path] = item.message;
    }
  }
  return new ApiError(payload?.error.message ?? `Request failed (${status})`, status, fieldErrors);
}

/**
 * Browser-side call to the admin API (same origin, proxied to the backend). The httpOnly session
 * cookie is sent automatically; an expired session sends the user back to the login page.
 */
async function request<T>(method: Method, path: string, body?: unknown, prefix = '/api/v1/admin'): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${prefix}${path}`, {
      method,
      credentials: 'same-origin',
      headers: body instanceof FormData ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Network error. Check that the server is running.', 0);
  }

  if (response.status === 401 && prefix === '/api/v1/admin') {
    // Deliberate full reload: drops any in-memory admin state before showing the login page.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign('/admin/login?expired=1');
    throw new ApiError('Session expired', 401);
  }
  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => null)) as ({ data: T } & ApiErrorBody) | null;
  if (!response.ok) throw toApiError(response.status, payload);
  return payload!.data;
}

export const adminApi = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ url: string; mime: string; size: number }>('POST', '/uploads', form);
  },
};

export const authApi = {
  login: (email: string, password: string) =>
    request<{ admin: { email: string } }>('POST', '/login', { email, password }, '/api/v1/auth'),
  logout: (everywhere = false) => request<void>('POST', '/logout', { everywhere }, '/api/v1/auth'),
  changeEmail: (currentPassword: string, newEmail: string) =>
    request<{ email: string }>('POST', '/change-email', { currentPassword, newEmail }, '/api/v1/auth'),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ updated: true }>('POST', '/change-password', { currentPassword, newPassword }, '/api/v1/auth'),
};

/** Asks Next.js to drop cached public pages for these tags so edits show up immediately. */
export async function refreshPublicSite(tags: string[]): Promise<void> {
  await fetch('/api/revalidate', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags }),
  }).catch(() => undefined); // best effort: the cache also expires on its own within a minute
}
