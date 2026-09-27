import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, PageHeader, formatDate } from '@/components/admin/ui';
import { INBOXES, isInboxKind, type InboxItem } from '@/lib/admin/inbox';
import { adminGet } from '@/lib/admin/server';
import { cn } from '@/lib/utils';

export async function generateMetadata({ params }: PageProps<'/admin/inbox/[kind]'>): Promise<Metadata> {
  const { kind } = await params;
  return { title: isInboxKind(kind) ? INBOXES[kind].label : 'Not found' };
}

interface Meta {
  page: number;
  totalPages: number;
  total: number;
}

export default async function InboxPage({ params, searchParams }: PageProps<'/admin/inbox/[kind]'>) {
  const [{ kind }, query] = await Promise.all([params, searchParams]);
  if (!isInboxKind(kind)) notFound();
  const inbox = INBOXES[kind];

  const status = typeof query.status === 'string' && (inbox.statuses as readonly string[]).includes(query.status) ? query.status : '';
  const page = Math.max(1, Number(query.page) || 1);
  const search = new URLSearchParams({ page: String(page), limit: '25' });
  if (status) search.set('status', status);

  const { data, meta } = await adminGet<InboxItem[], Meta>(`/${kind}?${search}`);
  const link = (next: { status?: string; page?: number }) => {
    const params = new URLSearchParams();
    const s = next.status ?? status;
    if (s) params.set('status', s);
    if (next.page && next.page > 1) params.set('page', String(next.page));
    const qs = params.toString();
    return `/admin/inbox/${kind}${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="space-y-8">
      <PageHeader title={inbox.label} description={inbox.description} />

      <nav aria-label="Filter by status" className="flex flex-wrap border-t border-l border-line">
        {['', ...inbox.statuses].map((option) => (
          <Link
            key={option || 'all'}
            href={option ? link({ status: option, page: 1 }) : `/admin/inbox/${kind}`}
            aria-current={option === status ? 'page' : undefined}
            className={cn(
              'border-r border-b border-line px-3.5 py-2 text-sm capitalize',
              option === status ? 'bg-fg text-bg' : 'text-muted hover:bg-surface hover:text-fg',
            )}
          >
            {option || 'All'}
          </Link>
        ))}
      </nav>

      {data.length === 0 ? (
        <p className="border border-dashed border-line p-8 text-center text-sm text-muted">Nothing here.</p>
      ) : (
        <ul className="border-t border-line">
          {data.map((item) => (
            <li key={item.id} className="border-b border-line">
              <Link href={`/admin/inbox/${kind}/${item.id}`} className="grid gap-1 py-4 hover:bg-surface sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 sm:px-2">
                <span className="min-w-0">
                  <span className={cn('block truncate text-sm', item.status === 'new' ? 'font-semibold' : 'font-medium')}>
                    {item.name}
                    {item.company && <span className="font-normal text-muted"> · {item.company}</span>}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-muted">
                    {[item.projectType, (item.message ?? item.description ?? '').slice(0, 120)].filter(Boolean).join(' — ')}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <Badge tone={item.status === 'new' ? 'accent' : 'neutral'}>{item.status}</Badge>
                  <span className="font-mono text-[11px] whitespace-nowrap text-subtle">{formatDate(item.createdAt, true)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {meta && meta.totalPages > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-between text-sm">
          {page > 1 ? <Link href={link({ page: page - 1 })}>← Newer</Link> : <span />}
          <span className="font-mono text-xs text-muted">
            Page {meta.page} of {meta.totalPages}
          </span>
          {page < meta.totalPages ? <Link href={link({ page: page + 1 })}>Older →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
