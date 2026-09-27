import { connection } from 'next/server';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { getSettings } from '@/lib/api/server';

export default async function SiteLayout({ children }: LayoutProps<'/'>) {
  // Render per request so the CSP nonce from src/proxy.ts can be applied (API data is still cached).
  await connection();
  const settings = await getSettings();

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] bg-accent px-4 py-2 text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div id="top" />
      <Navbar name={settings.profile.name || settings.siteName} />
      <main id="main" className="pt-16">
        {children}
      </main>
      <Footer settings={settings} />
      <CustomCursor />
    </>
  );
}
