'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { authApi } from '@/lib/admin/client';
import { Field, inputClass } from './Field';
import { Notice } from './ui';

const primary = 'h-11 w-full bg-fg text-sm font-medium text-bg hover:bg-accent hover:text-accent-ink disabled:opacity-50';
const RECOVERY_COMMAND = 'node scripts/set-vercel-secrets.mjs --reset-login';

function TerminalRecovery() {
  return (
    <div className="space-y-2 border-l-2 border-line-strong pl-4 text-sm text-muted">
      <p>
        Email sending is not set up yet, so no email was sent. You can still reset the login from the project folder on
        your computer:
      </p>
      <code className="block bg-surface px-3 py-2 font-mono text-xs break-all text-fg">{RECOVERY_COMMAND}</code>
      <p>It asks for a new password (and optionally a new email), then updates the live site in about a minute.</p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ emailEnabled: boolean } | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      setResult(await authApi.forgotPassword(email.trim()));
    } catch (err) {
      setError(err instanceof ApiError ? (err.fieldErrors.email ?? err.message) : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        {result.emailEnabled ? (
          <Notice kind="success">
            If that email belongs to the admin account, a reset link is on its way. It works once and expires in 30
            minutes. Check your spam folder if it doesn&apos;t arrive.
          </Notice>
        ) : (
          <TerminalRecovery />
        )}
        <Link href="/admin/login" className="inline-block text-sm text-fg underline underline-offset-4 hover:text-accent">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <p className="text-sm leading-relaxed text-muted">Enter your admin email and we&apos;ll send you a link to set a new password.</p>
      <Field label="Email">
        {({ id }) => (
          <input id={id} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        )}
      </Field>
      {error && <Notice kind="error">{error}</Notice>}
      <button type="submit" disabled={pending} className={primary}>
        {pending ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [done, setDone] = useState(false);

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return (
      <div className="space-y-6">
        <Notice kind="error">This reset link is incomplete or invalid. Please request a new one.</Notice>
        <Link href="/admin/forgot-password" className="inline-block text-sm text-fg underline underline-offset-4 hover:text-accent">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-6">
        <Notice kind="success">Your password has been changed. Every device has been signed out.</Notice>
        <Link href="/admin/login" className={`${primary} inline-flex items-center justify-center`}>
          Sign in
        </Link>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setFieldError('');
    if (password !== confirm) {
      setFieldError('The passwords do not match.');
      return;
    }
    setPending(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.newPassword) setFieldError(err.fieldErrors.newPassword);
      else setError(err instanceof ApiError ? err.message : 'Could not reset the password.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        )}
      </Field>
      <Field label="Confirm new password">
        {({ id }) => (
          <input id={id} type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        )}
      </Field>
      {error && (
        <div className="space-y-3">
          <Notice kind="error">{error}</Notice>
          <Link href="/admin/forgot-password" className="inline-block text-sm text-fg underline underline-offset-4 hover:text-accent">
            Request a new link
          </Link>
        </div>
      )}
      <button type="submit" disabled={pending} className={primary}>
        {pending ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  );
}
