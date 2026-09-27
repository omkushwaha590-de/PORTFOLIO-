import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourceForm } from '@/components/admin/ResourceForm';
import { Notice, PageHeader, formatDate } from '@/components/admin/ui';
import { RESOURCES } from '@/lib/admin/resources';
import { adminGet } from '@/lib/admin/server';
import type { SiteSettings } from '@/types/api';

export const metadata: Metadata = { title: 'Edit' };

export default async function EditResourcePage({ params, searchParams }: PageProps<'/admin/[resource]/[id]'>) {
  const [{ resource, id }, { created }] = await Promise.all([params, searchParams]);
  const config = RESOURCES[resource];
  if (!config || !/^[a-f\d]{24}$/i.test(id)) notFound();

  const [{ data: item }, { data: settings }] = await Promise.all([
    adminGet<Record<string, unknown>>(`/${config.key}/${id}`),
    adminGet<SiteSettings>('/settings'),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={String(item[config.titleField] ?? config.singular)}
        description={`${config.singular} · last updated ${formatDate(String(item.updatedAt), true)}`}
      />
      {created === '1' && <Notice kind="success">{config.singular} created.</Notice>}
      <ResourceForm resource={config.key} item={item} settings={settings} />
    </div>
  );
}
