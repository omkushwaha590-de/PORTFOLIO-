import type { Metadata } from 'next';
import { ChangeEmailForm, ChangePasswordForm, LogoutButton } from '@/components/admin/AuthForms';
import { PageHeader, formatDate } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/admin/server';

export const metadata: Metadata = { title: 'Account' };

export default async function AccountPage() {
  const admin = await requireAdmin();

  return (
    <div className="space-y-12">
      <PageHeader title="Account" description={admin.email} />

      <section className="space-y-5">
        <h2 className="font-semibold">Change login email</h2>
        <ChangeEmailForm currentEmail={admin.email} />
      </section>

      <section className="space-y-5 border-t border-line pt-8">
        <h2 className="font-semibold">Change password</h2>
        <ChangePasswordForm />
      </section>

      <section className="space-y-3 border-t border-line pt-8">
        <h2 className="font-semibold">Sessions</h2>
        {admin.lastLoginAt && <p className="text-sm text-muted">Last sign-in: {formatDate(admin.lastLoginAt, true)}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <LogoutButton className="h-10 border border-line-strong px-4 text-sm hover:border-fg">Sign out</LogoutButton>
          <LogoutButton everywhere className="h-10 border border-line px-4 text-sm text-muted hover:border-red-400 hover:text-red-300">
            Sign out on all devices
          </LogoutButton>
        </div>
      </section>

      <section className="space-y-2 border-t border-line pt-8 text-sm text-muted">
        <h2 className="font-semibold text-fg">Forgot your password?</h2>
        <p>
          From the project folder on your computer, run{' '}
          <code className="bg-surface px-1.5 py-0.5 font-mono text-xs text-fg">node scripts/set-vercel-secrets.mjs --reset-login</code>{' '}
          and follow the questions. It needs access to your Vercel account and resets the login after the API redeploys.
        </p>
      </section>
    </div>
  );
}
