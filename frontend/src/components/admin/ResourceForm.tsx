'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { adminApi, refreshPublicSite } from '@/lib/admin/client';
import { toFormState, toPayload, type FormState, type FormValue } from '@/lib/admin/form';
import { RESOURCES, allFields, type FieldDef } from '@/lib/admin/resources';
import { cn } from '@/lib/utils';
import type { SiteSettings } from '@/types/api';
import { FieldEditor } from './FieldEditor';
import { Notice } from './ui';

interface Props {
  resource: string;
  item: Record<string, unknown> | null;
  settings: SiteSettings | null;
}

const wide = (field: FieldDef) => !('half' in field && field.half);

/** Create / edit form for any content resource, driven by its field definitions. */
export function ResourceForm({ resource, item, settings }: Props) {
  const config = RESOURCES[resource]!;
  const fields = allFields(config);
  const router = useRouter();
  const mode = item ? 'update' : 'create';

  const [state, setState] = useState<FormState>(() => toFormState(fields, item));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const set = (name: string, value: FormValue) => {
    setState((current) => ({ ...current, [name]: value }));
    setDirty(true);
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage(null);
    try {
      const body = toPayload(fields, state, mode);
      const saved =
        mode === 'create'
          ? await adminApi.post<Record<string, unknown>>(`/${config.key}`, body)
          : await adminApi.patch<Record<string, unknown>>(`/${config.key}/${String(item!.id)}`, body);
      await refreshPublicSite(config.tags);
      setDirty(false);
      if (mode === 'create') {
        router.replace(`/admin/${config.key}/${String(saved.id)}?created=1`);
      } else {
        setState(toFormState(fields, saved));
        setMessage({ kind: 'success', text: 'Saved. The public site is updated.' });
        router.refresh();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // Nested paths like "results.0.value" map to their top-level field.
        const byField: Record<string, string> = {};
        for (const [path, text] of Object.entries(error.fieldErrors)) {
          const key = path.split('.')[0]!;
          byField[key] ??= text;
        }
        setErrors(byField);
        setMessage({ kind: 'error', text: Object.keys(byField).length ? 'Please fix the highlighted fields.' : error.message });
      } else {
        setMessage({ kind: 'error', text: 'Something went wrong while saving.' });
      }
    } finally {
      setSaving(false);
    }
  }

  const publicLink = item && config.publicPath?.(item);

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      {config.groups.map((group) => (
        <fieldset key={group.title} className="grid gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-2">
          <legend className="float-left mb-2 w-full font-mono text-[11px] text-subtle uppercase sm:col-span-2">{group.title}</legend>
          {group.fields.map((field) => (
            <div key={field.name} className={cn(wide(field) && 'sm:col-span-2')}>
              <FieldEditor
                field={field}
                value={state[field.name] ?? null}
                error={errors[field.name]}
                settings={settings}
                onChange={(value) => set(field.name, value)}
              />
            </div>
          ))}
        </fieldset>
      ))}

      {message && <Notice kind={message.kind}>{message.text}</Notice>}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-bg px-4 py-4 sm:-mx-8 sm:px-8">
        <button type="submit" disabled={saving} className="h-10 bg-fg px-5 text-sm font-medium text-bg hover:bg-accent hover:text-accent-ink disabled:opacity-50">
          {saving ? 'Saving…' : mode === 'create' ? `Create ${config.singular.toLowerCase()}` : 'Save changes'}
        </button>
        <Link href={`/admin/${config.key}`} className="h-10 border border-line-strong px-5 text-sm leading-10 hover:border-fg">
          Back to list
        </Link>
        {publicLink && (
          <a href={publicLink} target="_blank" rel="noopener noreferrer" className="text-sm text-muted underline underline-offset-4 hover:text-fg">
            View on site ↗
          </a>
        )}
        {dirty && <span className="text-xs text-subtle">Unsaved changes</span>}
      </div>
    </form>
  );
}
