import Link from 'next/link';
import { Badge, PageHeader, formatDate } from '@/components/admin/ui';
import { adminGet } from '@/lib/admin/server';

interface Dashboard {
  counts: {
    projects: number;
    publishedProjects: number;
    services: number;
    testimonials: number;
    skills: number;
    newMessages: number;
    newQuotes: number;
    gallery?: number;
  };
  recentMessages: { id: string; name: string; email: string; company: string; status: string; createdAt: string }[];
  recentQuotes: { id: string; name: string; email: string; projectType: string; status: string; createdAt: string }[];
}

export default async function DashboardPage() {
  const { data } = await adminGet<Dashboard>('/dashboard');
  const { counts } = data;

  const figures = [
    { label: 'New messages', value: counts.newMessages, href: '/admin/inbox/messages?status=new' },
    { label: 'New inquiries', value: counts.newQuotes, href: '/admin/inbox/quotes?status=new' },
    { label: 'Published projects', value: `${counts.publishedProjects}/${counts.projects}`, href: '/admin/projects' },
    { label: 'Growth Atlas photos', value: counts.gallery ?? 0, href: '/admin/gallery' },
  ];

  return (
    <div className="space-y-12">
      <PageHeader title="Dashboard" description="Overview of your content and incoming messages." />

      <dl className="grid grid-cols-2 gap-x-6 lg:grid-cols-4">
        {figures.map((figure) => (
          <Link key={figure.label} href={figure.href} className="group flex flex-col-reverse justify-end border-t border-fg py-4">
            <dt className="mt-1 text-sm text-muted group-hover:text-fg">{figure.label}</dt>
            <dd className="tabular text-4xl font-semibold tracking-[-0.03em]">{figure.value}</dd>
          </Link>
        ))}
      </dl>

      <div className="grid gap-10 lg:grid-cols-2">
        <Recent
          title="Latest messages"
          href="/admin/inbox/messages"
          empty="No messages yet."
          rows={data.recentMessages.map((m) => ({
            id: m.id,
            href: `/admin/inbox/messages/${m.id}`,
            primary: m.name,
            secondary: m.company || m.email,
            status: m.status,
            date: m.createdAt,
          }))}
        />
        <Recent
          title="Latest inquiries"
          href="/admin/inbox/quotes"
          empty="No inquiries yet."
          rows={data.recentQuotes.map((q) => ({
            id: q.id,
            href: `/admin/inbox/quotes/${q.id}`,
            primary: q.name,
            secondary: q.projectType,
            status: q.status,
            date: q.createdAt,
          }))}
        />
      </div>
    </div>
  );
}

function Recent({
  title,
  href,
  empty,
  rows,
}: {
  title: string;
  href: string;
  empty: string;
  rows: { id: string; href: string; primary: string; secondary: string; status: string; date: string }[];
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="text-xs text-muted hover:text-fg">
          View all →
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 border-t border-line pt-4 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 border-t border-line">
          {rows.map((row) => (
            <li key={row.id} className="border-b border-line">
              <Link href={row.href} className="flex items-center justify-between gap-4 py-3 hover:bg-surface">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{row.primary}</span>
                  <span className="block truncate text-xs text-muted">{row.secondary}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <Badge tone={row.status === 'new' ? 'accent' : 'neutral'}>{row.status}</Badge>
                  <span className="font-mono text-[11px] text-subtle">{formatDate(row.date)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
