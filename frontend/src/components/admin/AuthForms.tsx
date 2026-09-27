'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { authApi } from '@/lib/admin/client';
import { Field, inputClass } from './Field';
import { Notice } from './ui';

const primary = 'h-11 w-full bg-fg text-sm font-medium text-bg hover:bg-accent hover:text-accent-ink disabled:opacity-50';

export function LoginForm({ expired }: { expired: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await authApi.login(email.trim(), password);
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in.');
      setPassword('');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {expired && !error && <Notice kind="success">Your session ended. Please sign in again.</Notice>}
      <Field label="Email">
        {({ id }) => (
          <input id={id} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        )}
      </Field>
      <Field label="Password">
        {({ id }) => (
          <input
            id={id}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        )}
      </Field>
      {error && <Notice kind="error">{error}</Notice>}
      <button type="submit" disabled={pending} className={primary}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export function LogoutButton({ className, everywhere = false, children }: { className?: string; everywhere?: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={async () => {
        if (everywhere && !window.confirm('Sign out on every device, including this one?')) return;
        setPending(true);
        await authApi.logout(everywhere).catch(() => undefined);
        router.replace('/admin/login');
        router.refresh();
      }}
    >
      {pending ? 'Signing out…' : children}
    </button>
  );
}

export function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [fieldError, setFieldError] = useState('');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setFieldError('');
    if (next !== confirm) {
      setFieldError('The new passwords do not match.');
      return;
    }
    setPending(true);
    try {
      await authApi.changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setMessage({ kind: 'success', text: 'Password changed. Other devices have been signed out.' });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.newPassword) setFieldError(err.fieldErrors.newPassword);
      else setMessage({ kind: 'error', text: err instanceof ApiError ? err.message : 'Could not change the password.' });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-5">
      <Field label="Current password">
        {({ id }) => (
          <input id={id} type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
        )}
      </Field>
      <Field label="New password" hint="At least 12 characters, with upper and lower case letters, a number and a symbol." error={fieldError}>
        {({ id, describedBy, invalid }) => (
          <input
            id={id}
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={inputClass}
          />
        )}
      </Field>
      <Field label="Confirm new password">
        {({ id }) => (
          <input id={id} type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        )}
      </Field>
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
      <button type="submit" disabled={pending} className={primary}>
        {pending ? 'Updating…' : 'Change password'}
      </button>
    </form>
  );
}
