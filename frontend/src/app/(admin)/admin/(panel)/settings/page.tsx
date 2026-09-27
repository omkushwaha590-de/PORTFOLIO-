import type { Metadata } from 'next';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { PageHeader } from '@/components/admin/ui';
import { adminGet } from '@/lib/admin/server';
import type { SiteSettings } from '@/types/api';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const { data } = await adminGet<SiteSettings>('/settings');
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Profile, home page figures, contact details and form options." />
      <SettingsForm settings={data} />
    </div>
  );
}
