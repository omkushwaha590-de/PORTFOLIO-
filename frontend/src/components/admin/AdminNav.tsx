'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SECTIONS = [
  {
    title: 'Overview',
    links: [{ href: '/admin', label: 'Dashboard' }],
  },
  {
    title: 'Content',
    links: [
      { href: '/admin/gallery', label: 'The Growth Atlas' },
      { href: '/admin/projects', label: 'Projects' },
      { href: '/admin/services', label: 'Expertise' },
      { href: '/admin/experience', label: 'Experience' },
      { href: '/admin/skills', label: 'Skills' },
      { href: '/admin/testimonials', label: 'Testimonials' },
    ],
  },
  {
    title: 'Inbox',
    links: [
      { href: '/admin/inbox/messages', label: 'Messages' },
      { href: '/admin/inbox/quotes', label: 'Inquiries' },
    ],
  },
  {
    title: 'Site',
    links: [
      { href: '/admin/settings', label: 'Settings' },
      { href: '/admin/account', label: 'Account' },
    ],
  },
];

export function AdminNav({ newCounts }: { newCounts: { messages: number; quotes: number } }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));
  const countFor = (href: string) =>
    href.endsWith('/messages') ? newCounts.messages : href.endsWith('/quotes') ? newCounts.quotes : 0;

  return (
    <nav aria-label="Admin" className="flex gap-6 overflow-x-auto lg:flex-col lg:gap-7 lg:overflow-visible">
      {SECTIONS.map((section) => (
        <div key={section.title} className="shrink-0">
          <p className="hidden font-mono text-[10px] text-subtle uppercase lg:block">{section.title}</p>
          <ul className="flex gap-4 lg:mt-2 lg:flex-col lg:gap-0.5">
            {section.links.map((link) => {
              const active = isActive(link.href);
              const count = countFor(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between gap-3 py-1.5 text-sm whitespace-nowrap lg:-mx-2 lg:px-2',
                      active ? 'text-fg lg:bg-surface-2' : 'text-muted hover:text-fg',
                    )}
                  >
                    {link.label}
                    {count > 0 && <span className="bg-accent px-1.5 font-mono text-[10px] text-accent-ink">{count}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
