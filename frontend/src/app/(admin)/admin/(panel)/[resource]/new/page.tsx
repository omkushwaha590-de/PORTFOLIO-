import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourceForm } from '@/components/admin/ResourceForm';
import { PageHeader } from '@/components/admin/ui';
import { RESOURCES } from '@/lib/admin/resources';
import { adminGet } from '@/lib/admin/server';
import type { SiteSettings } from '@/types/api';

export const metadata: Metadata = { title: 'New entry' };

export default async function NewResourcePage({ params }: PageProps<'/admin/[resource]/new'>) {
  const { resource } = await params;
  const config = RESOURCES[resource];
  if (!config) notFound();

  const { data: settings } = await adminGet<SiteSettings>('/settings');

  return (
    <div className="space-y-8">
      <PageHeader title={`New ${config.singular.toLowerCase()}`} description="New entries start as drafts unless you set them to published." />
      <ResourceForm resource={config.key} item={null} settings={settings} />
    </div>
  );
}
