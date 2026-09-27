'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { NAV_LINKS } from './nav-links';

export function Navbar({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu on navigation (state adjusted during render, not in an effect).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

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
        <Link href="/" className="text-[15px] font-semibold tracking-[-0.01em]">
          {name}
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm text-muted transition-colors hover:text-fg">
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

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-bg lg:hidden">
          <ul className="mx-auto max-w-[1200px] px-4 sm:px-6">
            {NAV_LINKS.map((link, index) => (
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
