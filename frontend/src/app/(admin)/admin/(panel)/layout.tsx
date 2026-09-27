import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';
import { LogoutButton } from '@/components/admin/AuthForms';
import { adminGet, requireAdmin } from '@/lib/admin/server';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin' },
  robots: { index: false, follow: false },
};

interface DashboardData {
  counts: { newMessages: number; newQuotes: number };
}

/**
 * Admin shell. The session is checked here AND by every page's own data request, because layouts
 * are not re-rendered on client-side navigation.
 */
export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const admin = await requireAdmin();
  const { data } = await adminGet<DashboardData>('/dashboard');

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-surface px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-6 lg:py-8">
        <div className="mb-4 flex items-center justify-between lg:mb-10 lg:block">
          <Link href="/admin" className="font-semibold tracking-[-0.01em]">
            Portfolio admin
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-fg lg:mt-1 lg:block">
            View site ↗
          </a>
        </div>
        <AdminNav newCounts={{ messages: data.counts.newMessages, quotes: data.counts.newQuotes }} />
        <div className="mt-10 hidden border-t border-line pt-4 lg:block">
          <p className="truncate text-xs text-muted" title={admin.email}>
            {admin.email}
          </p>
          <LogoutButton className="mt-2 text-xs text-fg underline underline-offset-4 hover:text-accent">Sign out</LogoutButton>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
