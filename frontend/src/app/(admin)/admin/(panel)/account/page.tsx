import type { Metadata } from 'next';
import { ChangePasswordForm, LogoutButton } from '@/components/admin/AuthForms';
import { PageHeader, formatDate } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/admin/server';

export const metadata: Metadata = { title: 'Account' };

export default async function AccountPage() {
  const admin = await requireAdmin();

  return (
    <div className="space-y-12">
      <PageHeader title="Account" description={admin.email} />

      <section className="space-y-5">
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
    </div>
  );
}
