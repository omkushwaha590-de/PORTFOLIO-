'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { ButtonLink } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from './nav-links';

export function Navbar({ name, hiddenLinks = [] }: { name: string; hiddenLinks?: string[] }) {
  const hiddenKey = hiddenLinks.join(',');
  const links = useMemo(() => NAV_LINKS.filter((link) => !hiddenKey.split(',').includes(link.href)), [hiddenKey]);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu on navigation (state adjusted during render, not in an effect).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Highlight the home-page section currently being read.
  const [activeSection, setActiveSection] = useState('');
  useEffect(() => {
    if (pathname !== '/') return;
    const sections = links.map((link) => document.getElementById(link.href.split('#')[1]!)).filter(
      (section): section is HTMLElement => Boolean(section),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname, links]);
  const isActive = (href: string) => pathname === '/' && href.endsWith(`#${activeSection}`);

  // Escape closes the menu and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Same gold sweep as the "Get in touch" button. */}
        <Link
          href="/"
          className="relative isolate -mx-2 overflow-hidden px-2 py-1 text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-500 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-accent before:transition-transform before:duration-500 before:ease-[cubic-bezier(.22,1,.36,1)] before:content-[''] hover:text-accent-ink hover:before:scale-x-100 focus-visible:before:scale-x-100"
        >
          {name}
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'true' : undefined}
                className={cn(
                  'relative py-1 text-sm transition-colors duration-300 hover:text-fg',
                  "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-accent after:transition-transform after:duration-500 after:content-['']",
                  isActive(link.href) ? 'text-fg after:scale-x-100' : 'text-muted after:scale-x-0 hover:after:scale-x-100',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Wrapper controls visibility: `hidden` on the button itself would clash with its `inline-flex`. */}
          <span className="hidden sm:block">
            <ButtonLink href="/collaborate" className="h-9 px-4">
              Get in touch
            </ButtonLink>
          </span>
          <button
            ref={menuButtonRef}
            type="button"
            className="grid size-9 place-items-center border border-line text-fg lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>
      <ScrollProgress />

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-bg lg:hidden">
          <ul className="mx-auto max-w-[1200px] px-4 sm:px-6">
            {links.map((link, index) => (
              <li key={link.href} className="border-b border-line">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-4 text-lg text-fg"
                >
                  {link.label}
                  <span className="font-mono text-xs text-subtle">{String(index + 1).padStart(2, '0')}</span>
                </Link>
              </li>
            ))}
            <li className="py-4">
              <ButtonLink href="/collaborate" className="w-full" onClick={() => setOpen(false)}>
                Get in touch
              </ButtonLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
