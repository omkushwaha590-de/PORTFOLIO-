import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/admin/PasswordResetForms';

export const metadata: Metadata = {
  title: 'Forgot password',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs text-muted">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Forgot password</h1>
        <div className="mt-8 border-t border-fg pt-8">
          <ForgotPasswordForm />
        </div>
        <Link href="/admin/login" className="mt-8 inline-block text-sm text-muted hover:text-fg">
          ← Back to sign in
        </Link>
      </div>
    </main>
  );
}
