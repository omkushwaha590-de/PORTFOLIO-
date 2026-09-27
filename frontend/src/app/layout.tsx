import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Inter_Tight } from 'next/font/google';
import './globals.css';

const interTight = Inter_Tight({ variable: '--font-inter-tight', subsets: ['latin'], display: 'swap' });
const plexMono = IBM_Plex_Mono({ variable: '--font-plex-mono', subsets: ['latin'], weight: ['400', '500'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Yogesh N Modi', template: '%s | Yogesh N Modi' },
  description:
    'Quality and operations leader, Six Sigma Black Belt and ISO Lead Auditor. Solving manufacturing problems at the root and turning the results into business value.',
};

export const viewport: Viewport = {
  themeColor: '#0b1829',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${interTight.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
