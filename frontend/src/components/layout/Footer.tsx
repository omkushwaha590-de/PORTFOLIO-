import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import type { SiteSettings } from '@/types/api';
import { NAV_LINKS } from './nav-links';

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const name = settings.profile.name || settings.siteName;

  return (
    <footer className="border-t border-line bg-bg-deep">
      <Container className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <p className="font-semibold">{name}</p>
          {settings.profile.role && <p className="mt-1 text-sm text-muted">{settings.profile.role}</p>}
        </div>

        <div className="space-y-2 text-sm lg:col-span-5">
          {settings.contactEmail && (
            <p>
              <a href={`mailto:${settings.contactEmail}`} className="underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                {settings.contactEmail}
              </a>
            </p>
          )}
          {settings.location && <p className="text-muted">{settings.location}</p>}
          {settings.socials.length > 0 && (
            <p className="flex flex-wrap gap-x-5 pt-2">
              {settings.socials.map((social) => (
                <a key={social.url} href={social.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg">
                  {social.label}
                </a>
              ))}
            </p>
          )}
        </div>

        <nav aria-label="Footer" className="lg:col-span-4">
          <ul className="grid grid-cols-2 gap-y-2 text-sm text-muted">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container className="flex justify-between border-t border-line py-5 font-mono text-xs text-subtle">
        <p>
          © {year} {name}
        </p>
        <a href="#top" className="hover:text-fg">
          Top ↑
        </a>
      </Container>
    </footer>
  );
}
