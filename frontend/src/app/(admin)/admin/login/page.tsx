import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/AuthForms';
import { getAdmin } from '@/lib/admin/server';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  if (await getAdmin()) redirect('/admin');
  const { expired } = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs text-muted">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Sign in</h1>
        <div className="mt-8 border-t border-fg pt-8">
          <LoginForm expired={expired === '1'} />
          <p className="mt-5 text-right">
            <Link href="/admin/forgot-password" className="text-sm text-muted underline underline-offset-4 hover:text-fg">
              Forgot password?
            </Link>
          </p>
        </div>
        <Link href="/" className="mt-8 inline-block text-sm text-muted hover:text-fg">
          ← Back to the website
        </Link>
      </div>
    </main>
  );
}
