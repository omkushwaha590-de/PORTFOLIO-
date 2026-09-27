import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from '@/components/admin/PasswordResetForms';

export const metadata: Metadata = {
  title: 'Set a new password',
  robots: { index: false, follow: false },
  // Keep the reset token out of the Referer header sent to other sites.
  referrer: 'no-referrer',
};

export default async function ResetPasswordPage({ searchParams }: PageProps<'/admin/reset-password'>) {
  const { token } = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs text-muted">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Set a new password</h1>
        <div className="mt-8 border-t border-fg pt-8">
          <ResetPasswordForm token={typeof token === 'string' ? token : ''} />
        </div>
        <Link href="/admin/login" className="mt-8 inline-block text-sm text-muted hover:text-fg">
          ← Back to sign in
        </Link>
      </div>
    </main>
  );
}
