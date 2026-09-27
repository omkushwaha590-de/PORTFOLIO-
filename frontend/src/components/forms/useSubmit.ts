'use client';

import { useState } from 'react';
import { ApiError, postJson } from '@/lib/api/client';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** Shared submit state for public forms: pending flag, field errors and a form-level message. */
export function useSubmit(path: string) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(payload: Record<string, unknown>) {
    setStatus('submitting');
    setMessage('');
    setFieldErrors({});
    try {
      await postJson(path, payload);
      setStatus('success');
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFieldErrors(apiError?.fieldErrors ?? {});
      setMessage(
        apiError?.status === 429
          ? 'Too many submissions from your network. Please try again in a little while, or email directly.'
          : (apiError?.message ?? 'Something went wrong. Please try again.'),
      );
      setStatus('error');
    }
  }

  function reset() {
    setStatus('idle');
    setMessage('');
    setFieldErrors({});
  }

  return { status, message, fieldErrors, submit, reset };
}

/** Reads a form into a plain object of trimmed strings. */
export function readForm(form: HTMLFormElement): Record<string, string> {
  const data: Record<string, string> = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value === 'string') data[key] = value.trim();
  });
  return data;
}
