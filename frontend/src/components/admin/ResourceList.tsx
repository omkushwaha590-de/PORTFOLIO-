'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { adminApi, refreshPublicSite } from '@/lib/admin/client';
import { RESOURCES } from '@/lib/admin/resources';
import { Badge, Notice } from './ui';

type Item = Record<string, unknown> & { id: string };

const actionButton = 'border border-line px-2.5 py-1.5 text-xs text-muted hover:border-fg hover:text-fg disabled:opacity-40';

/** Table of a content resource with publish, feature, reorder and delete actions. */
export function ResourceList({ resource, initialItems }: { resource: string; initialItems: Item[] }) {
  const config = RESOURCES[resource]!;
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function run(key: string, action: () => Promise<void>) {
    setBusy(key);
    setError('');
    try {
      await action();
      await refreshPublicSite(config.tags);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  const patch = (item: Item, body: Record<string, unknown>) =>
    run(item.id, async () => {
      const updated = await adminApi.patch<Item>(`/${config.key}/${item.id}`, body);
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, ...updated } : entry)));
    });

  const move = (index: number, direction: -1 | 1) =>
    run('reorder', async () => {
      const next = [...items];
      const [moved] = next.splice(index, 1);
      next.splice(index + direction, 0, moved!);
      setItems(next);
      await adminApi.patch(`/${config.key}/reorder`, { ids: next.map((entry) => entry.id) });
    });

  const remove = (item: Item) => {
    const name = String(item[config.titleField] ?? config.singular);
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    void run(item.id, async () => {
      await adminApi.delete(`/${config.key}/${item.id}`);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    });
  };

  if (items.length === 0) {
    return (
      <p className="border border-dashed border-line p-8 text-center text-sm text-muted">
        Nothing here yet.{' '}
        <Link href={`/admin/${config.key}/new`} className="text-fg underline underline-offset-4">
          Create the first {config.singular.toLowerCase()}
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && <Notice kind="error">{error}</Notice>}
      <ol className="border-t border-line">
        {items.map((item, index) => {
          const published = item.status === 'published';
          const publicLink = config.publicPath?.(item);
          return (
            <li key={item.id} className="grid gap-3 border-b border-line py-4 lg:grid-cols-[3rem_1fr_auto] lg:items-center">
              {config.thumbnail?.(item) ? (
                // Plain <img>: admin previews may point at any uploaded URL.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.thumbnail(item)} alt="" className="size-12 bg-surface object-cover" />
              ) : (
                <span className="font-mono text-xs text-subtle">{String(index + 1).padStart(2, '0')}</span>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/${config.key}/${item.id}`} className="font-medium hover:underline hover:underline-offset-4">
                    {String(item[config.titleField] ?? 'Untitled')}
                  </Link>
                  {config.hasStatus && <Badge tone={published ? 'positive' : 'neutral'}>{published ? 'Published' : 'Draft'}</Badge>}
                  {config.hasFeatured && Boolean(item.featured) && <Badge tone="accent">Featured</Badge>}
                </div>
                {config.subtitle && <p className="mt-1 truncate text-sm text-muted">{config.subtitle(item)}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  className={actionButton}
                  disabled={index === 0 || busy !== null}
                  onClick={() => void move(index, -1)}
                  aria-label={`Move ${String(item[config.titleField])} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={actionButton}
                  disabled={index === items.length - 1 || busy !== null}
                  onClick={() => void move(index, 1)}
                  aria-label={`Move ${String(item[config.titleField])} down`}
                >
                  ↓
                </button>
                {config.hasStatus && (
                  <button type="button" className={actionButton} disabled={busy !== null} onClick={() => void patch(item, { status: published ? 'draft' : 'published' })}>
                    {published ? 'Unpublish' : 'Publish'}
                  </button>
                )}
                {config.hasFeatured && (
                  <button type="button" className={actionButton} disabled={busy !== null} onClick={() => void patch(item, { featured: !item.featured })}>
                    {item.featured ? 'Unfeature' : 'Feature'}
                  </button>
                )}
                <Link href={`/admin/${config.key}/${item.id}`} className={actionButton}>
                  Edit
                </Link>
                {publicLink && (
                  <a href={publicLink} target="_blank" rel="noopener noreferrer" className={actionButton}>
                    View ↗
                  </a>
                )}
                <button type="button" className={`${actionButton} hover:border-red-400 hover:text-red-300`} disabled={busy !== null} onClick={() => remove(item)}>
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
