import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ResourceList } from '@/components/admin/ResourceList';
import { PageHeader } from '@/components/admin/ui';
import { RESOURCES } from '@/lib/admin/resources';
import { adminGet } from '@/lib/admin/server';

export async function generateMetadata({ params }: PageProps<'/admin/[resource]'>): Promise<Metadata> {
  const { resource } = await params;
  return { title: RESOURCES[resource]?.label ?? 'Not found' };
}

export default async function ResourceListPage({ params }: PageProps<'/admin/[resource]'>) {
  const { resource } = await params;
  const config = RESOURCES[resource];
  if (!config) notFound();

  const { data } = await adminGet<(Record<string, unknown> & { id: string })[]>(`/${config.key}?limit=100`);

  return (
    <div className="space-y-8">
      <PageHeader
        title={config.label}
        description={`${data.length} ${data.length === 1 ? 'entry' : 'entries'}. Order here is the order on the site.`}
        actions={
          <Link
            href={`/admin/${config.key}/new`}
            className="inline-flex h-10 items-center bg-fg px-4 text-sm font-medium text-bg hover:bg-accent hover:text-accent-ink"
          >
            New {config.singular.toLowerCase()}
          </Link>
        }
      />
      {/* key resets local list state when the server data changes */}
      <ResourceList key={data.map((item) => `${item.id}:${String(item.updatedAt)}`).join(',')} resource={config.key} initialItems={data} />
    </div>
  );
}
