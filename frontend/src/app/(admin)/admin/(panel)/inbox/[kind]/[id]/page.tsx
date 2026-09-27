import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { InboxDetail } from '@/components/admin/InboxDetail';
import { PageHeader, formatDate } from '@/components/admin/ui';
import { INBOXES, isInboxKind, type InboxItem } from '@/lib/admin/inbox';
import { adminGet, adminPatch } from '@/lib/admin/server';

export const metadata: Metadata = { title: 'Inbox' };

export default async function InboxItemPage({ params }: PageProps<'/admin/inbox/[kind]/[id]'>) {
  const { kind, id } = await params;
  if (!isInboxKind(kind) || !/^[a-f\d]{24}$/i.test(id)) notFound();
  const inbox = INBOXES[kind];

  const { data: item } = await adminGet<InboxItem>(`/${kind}/${id}`);

  // Opening a new message marks it as read.
  let status = item.status;
  if (kind === 'messages' && status === 'new') {
    await adminPatch(`/messages/${id}`, { status: 'read' });
    status = 'read';
  }

  const rows = [
    { label: 'Email', value: item.email, href: `mailto:${item.email}` },
    { label: 'Phone', value: item.phone, href: item.phone ? `tel:${item.phone.replace(/[^+\d]/g, '')}` : undefined },
    { label: 'Organisation', value: item.company },
    { label: 'Type', value: item.projectType },
    { label: 'Timeline', value: item.timeline },
    { label: 'Budget', value: item.budget },
    { label: 'Received', value: formatDate(item.createdAt, true) },
  ].filter((row) => row.value);

  const body = item.message ?? item.description ?? '';

  return (
    <div className="space-y-8">
      <Link href={`/admin/inbox/${kind}`} className="font-mono text-xs text-muted hover:text-fg">
        ← {inbox.label}
      </Link>
      <PageHeader title={item.name} description={`${inbox.singular} · ${formatDate(item.createdAt, true)}`} />

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label} className="border-t border-line py-3">
                <dt className="font-mono text-[11px] text-subtle uppercase">{row.label}</dt>
                <dd className="mt-1 text-sm break-words">
                  {row.href ? (
                    <a href={row.href} className="underline underline-offset-4 hover:text-accent">
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <section>
            <h2 className="font-mono text-[11px] text-subtle uppercase">{kind === 'messages' ? 'Message' : 'Description'}</h2>
            {/* Visitor-submitted text: rendered as plain text, never as HTML. */}
            <p className="mt-3 border-t border-fg pt-4 leading-relaxed whitespace-pre-wrap text-fg/90">{body}</p>
          </section>

          {item.requirements && item.requirements.length > 0 && (
            <section>
              <h2 className="font-mono text-[11px] text-subtle uppercase">Specific needs</h2>
              <ul className="mt-3 space-y-1.5 border-t border-line pt-4 text-sm">
                {item.requirements.map((requirement) => (
                  <li key={requirement}>– {requirement}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <InboxDetail
          kind={kind}
          id={item.id}
          status={status}
          notes={item.notes}
          statuses={inbox.statuses}
          replyTo={item.email}
          replySubject={item.projectType || 'Your message'}
        />
      </div>
    </div>
  );
}
