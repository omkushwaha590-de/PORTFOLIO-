'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { adminApi, refreshPublicSite } from '@/lib/admin/client';
import { toFormState, toPayload, type FormState, type FormValue } from '@/lib/admin/form';
import type { FieldDef, FieldGroup } from '@/lib/admin/resources';
import { cn } from '@/lib/utils';
import type { SiteSettings } from '@/types/api';
import { FieldEditor } from './FieldEditor';
import { Notice } from './ui';

/** Settings are stored nested (profile.name); the form works with flat "profile.name" keys. */
const GROUPS: FieldGroup[] = [
  {
    title: 'Profile',
    fields: [
      { type: 'text', name: 'profile.name', label: 'Name', max: 120, half: true },
      { type: 'text', name: 'profile.role', label: 'Role line', max: 160, half: true, hint: 'Small text above your name.' },
      { type: 'text', name: 'profile.headline', label: 'Headline', max: 200 },
      { type: 'textarea', name: 'profile.intro', label: 'Intro', max: 1000, rows: 3 },
      {
        type: 'textarea',
        name: 'profile.about',
        label: 'About',
        max: 10000,
        rows: 8,
        hint: 'The first sentence becomes the large About statement. Separate paragraphs with a blank line.',
      },
      { type: 'image', name: 'profile.photoUrl', label: 'Portrait' },
      { type: 'text', name: 'profile.photoAlt', label: 'Portrait description (alt text)', max: 200 },
    ],
  },
  {
    title: 'Home page figures',
    fields: [
      {
        type: 'pairs',
        name: 'stats',
        label: 'Figures',
        keys: ['value', 'label'],
        keyLabels: ['Value (e.g. 16+)', 'Label'],
        hint: 'Real numbers only. Up to 8.',
      },
    ],
  },
  {
    title: 'Contact & links',
    fields: [
      { type: 'text', name: 'siteName', label: 'Site name', max: 120, half: true },
      { type: 'text', name: 'tagline', label: 'Tagline', max: 300, half: true },
      { type: 'email', name: 'contactEmail', label: 'Public email', max: 254, half: true },
      { type: 'text', name: 'location', label: 'Location', max: 120, half: true },
      { type: 'url', name: 'resumeUrl', label: 'CV / résumé URL', hint: 'Adds a "Download CV" link in the hero when set.' },
      { type: 'pairs', name: 'socials', label: 'Social links', keys: ['label', 'url'], keyLabels: ['Label (e.g. LinkedIn)', 'https://…'] },
    ],
  },
  {
    title: 'Form & filter options',
    fields: [
      { type: 'list', name: 'projectCategories', label: 'Project categories', hint: 'One per line. Used for filters on the Work page.' },
      { type: 'list', name: 'projectTypes', label: 'Inquiry types', hint: 'Options in the contact and collaboration forms.' },
      { type: 'list', name: 'timelineOptions', label: 'Timeline options' },
      { type: 'list', name: 'budgetOptions', label: 'Budget options' },
    ],
  },
];

const FIELDS: FieldDef[] = GROUPS.flatMap((group) => group.fields);

function flatten(settings: SiteSettings): Record<string, unknown> {
  const flat: Record<string, unknown> = { ...settings };
  for (const [key, value] of Object.entries(settings.profile)) flat[`profile.${key}`] = value;
  return flat;
}

function nest(flat: Record<string, unknown>): Record<string, unknown> {
  const body: Record<string, unknown> = { profile: {} };
  for (const [key, value] of Object.entries(flat)) {
    if (key.startsWith('profile.')) (body.profile as Record<string, unknown>)[key.slice(8)] = value;
    else body[key] = value;
  }
  return body;
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(() => toFormState(FIELDS, flatten(settings)));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage(null);
    try {
      await adminApi.put('/settings', nest(toPayload(FIELDS, state, 'update')));
      await refreshPublicSite(['settings']);
      setMessage({ kind: 'success', text: 'Settings saved. The public site is updated.' });
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        const byField: Record<string, string> = {};
        for (const [path, text] of Object.entries(error.fieldErrors)) {
          const parts = path.split('.');
          const key = parts[0] === 'profile' ? `profile.${parts[1]}` : parts[0]!;
          byField[key] ??= text;
        }
        setErrors(byField);
        setMessage({ kind: 'error', text: Object.keys(byField).length ? 'Please fix the highlighted fields.' : error.message });
      } else {
        setMessage({ kind: 'error', text: 'Could not save settings.' });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      {GROUPS.map((group) => (
        <fieldset key={group.title} className="grid gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-2">
          <legend className="float-left mb-2 w-full font-mono text-[11px] text-subtle uppercase sm:col-span-2">{group.title}</legend>
          {group.fields.map((field) => (
            <div key={field.name} className={cn(!('half' in field && field.half) && 'sm:col-span-2')}>
              <FieldEditor
                field={field}
                value={state[field.name] ?? null}
                error={errors[field.name]}
                settings={settings}
                onChange={(value: FormValue) => setState((current) => ({ ...current, [field.name]: value }))}
              />
            </div>
          ))}
        </fieldset>
      ))}
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
      <div className="sticky bottom-0 -mx-4 border-t border-line bg-bg px-4 py-4 sm:-mx-8 sm:px-8">
        <button type="submit" disabled={saving} className="h-10 bg-fg px-5 text-sm font-medium text-bg hover:bg-accent hover:text-accent-ink disabled:opacity-50">
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}
