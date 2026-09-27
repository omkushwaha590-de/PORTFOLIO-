import type { ApiErrorBody } from '@/types/api';

/** Error thrown by browser-side API calls, carrying per-field messages from server validation. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** Browser-side POST to the same-origin API (proxied to the backend by next.config rewrites). */
export async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Network error — please check your connection and try again.', 0);
  }

  if (response.ok) return (await response.json()) as T;

  const payload = (await response.json().catch(() => null)) as ApiErrorBody | null;
  const fieldErrors: Record<string, string> = {};
  const details = payload?.error.details;
  if (Array.isArray(details)) {
    for (const item of details as { path?: string; message?: string }[]) {
      if (item.path && item.message && !fieldErrors[item.path]) fieldErrors[item.path] = item.message;
    }
  }
  throw new ApiError(payload?.error.message ?? 'Something went wrong. Please try again.', response.status, fieldErrors);
}
