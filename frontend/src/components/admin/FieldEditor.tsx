'use client';

import { useRef, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { adminApi } from '@/lib/admin/client';
import type { FormValue, MediaValue } from '@/lib/admin/form';
import type { FieldDef } from '@/lib/admin/resources';
import { cn } from '@/lib/utils';
import type { SiteSettings } from '@/types/api';
import { Field, inputClass } from './Field';

interface Props {
  field: FieldDef;
  value: FormValue;
  error?: string;
  settings: SiteSettings | null;
  onChange: (value: FormValue) => void;
}

const smallButton = 'border border-line px-2.5 py-1.5 text-xs text-muted hover:border-fg hover:text-fg disabled:opacity-50';

/** Renders the right control for a field definition. */
export function FieldEditor({ field, value, error, settings, onChange }: Props) {
  const required = 'required' in field ? field.required : false;

  switch (field.type) {
    case 'checkbox':
      return (
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            className="mt-0.5 size-4 accent-[var(--accent)]"
          />
          <span>
            {field.label}
            {field.hint && <span className="block text-xs text-subtle">{field.hint}</span>}
          </span>
        </label>
      );

    case 'textarea':
    case 'list':
      return (
        <Field label={field.label} hint={field.hint} error={error} required={required}>
          {({ id, describedBy, invalid }) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              rows={field.type === 'textarea' ? (field.rows ?? 4) : 4}
              maxLength={field.type === 'textarea' ? field.max : undefined}
              value={String(value ?? '')}
              onChange={(event) => onChange(event.target.value)}
              className={cn(inputClass, 'resize-y leading-relaxed')}
            />
          )}
        </Field>
      );

    case 'select': {
      const options = typeof field.options === 'function' ? (settings ? field.options(settings) : []) : field.options;
      const current = String(value ?? '');
      // Keep an existing value selectable even if it was removed from the option list.
      const all = current && !options.includes(current) ? [current, ...options] : options;
      return (
        <Field label={field.label} hint={field.hint} error={error} required={required}>
          {({ id, describedBy, invalid }) => (
            <select
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              value={current}
              onChange={(event) => onChange(event.target.value)}
              className={inputClass}
            >
              {!current && <option value="">Select…</option>}
              {all.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </Field>
      );
    }

    case 'pairs':
      return <PairsEditor field={field} value={(value as Record<string, string>[]) ?? []} error={error} onChange={onChange} />;

    case 'media':
      return (
        <div className="space-y-2">
          <p className="text-sm text-fg">{field.label}</p>
          <MediaEditor value={value as MediaValue | null} onChange={onChange} allowRemove />
          {field.hint && <p className="text-xs text-subtle">{field.hint}</p>}
          {error && <p className="text-xs text-red-300">{error}</p>}
        </div>
      );

    case 'mediaList': {
      const list = (value as MediaValue[]) ?? [];
      return (
        <div className="space-y-3">
          <p className="text-sm text-fg">{field.label}</p>
          {list.map((media, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <MediaEditor
                  value={media}
                  withCaption
                  onChange={(next) => onChange(list.map((item, i) => (i === index ? (next as MediaValue) : item)))}
                />
              </div>
              <button type="button" className={cn(smallButton, 'self-start')} onClick={() => onChange(list.filter((_, i) => i !== index))}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className={smallButton} onClick={() => onChange([...list, { url: '', alt: '', caption: '' }])}>
            + Add image
          </button>
          {error && <p className="text-xs text-red-300">{error}</p>}
        </div>
      );
    }

    case 'image':
      return (
        <div className="space-y-2">
          <p className="text-sm text-fg">{field.label}</p>
          <MediaEditor
            value={value ? { url: String(value), alt: '', caption: '' } : null}
            urlOnly
            allowRemove
            onChange={(next) => onChange((next as MediaValue | null)?.url ?? '')}
          />
          {error && <p className="text-xs text-red-300">{error}</p>}
        </div>
      );

    default:
      return (
        <Field label={field.label} hint={field.hint} error={error} required={required}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
              inputMode={field.type === 'number' ? 'numeric' : undefined}
              min={field.type === 'number' ? field.min : undefined}
              max={field.type === 'number' ? field.max : undefined}
              maxLength={field.type !== 'number' ? field.max : undefined}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              value={String(value ?? '')}
              onChange={(event) => onChange(event.target.value)}
              className={inputClass}
            />
          )}
        </Field>
      );
  }
}

function PairsEditor({
  field,
  value,
  error,
  onChange,
}: {
  field: Extract<FieldDef, { type: 'pairs' }>;
  value: Record<string, string>[];
  error?: string;
  onChange: (value: FormValue) => void;
}) {
  const [a, b] = field.keys;
  const update = (index: number, key: string, text: string) =>
    onChange(value.map((row, i) => (i === index ? { ...row, [key]: text } : row)));

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 text-sm text-fg">{field.label}</legend>
      {value.map((row, index) => (
        <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-2">
          <input aria-label={`${field.keyLabels[0]} ${index + 1}`} placeholder={field.keyLabels[0]} value={row[a] ?? ''} onChange={(e) => update(index, a, e.target.value)} className={inputClass} />
          <input aria-label={`${field.keyLabels[1]} ${index + 1}`} placeholder={field.keyLabels[1]} value={row[b] ?? ''} onChange={(e) => update(index, b, e.target.value)} className={inputClass} />
          <button type="button" className={smallButton} onClick={() => onChange(value.filter((_, i) => i !== index))}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className={smallButton} onClick={() => onChange([...value, { [a]: '', [b]: '' }])}>
        + Add row
      </button>
      {field.hint && <p className="text-xs text-subtle">{field.hint}</p>}
      {error && <p className="text-xs text-red-300">{error}</p>}
    </fieldset>
  );
}

/** Image URL with upload, preview and alt text. */
function MediaEditor({
  value,
  onChange,
  withCaption,
  urlOnly,
  allowRemove,
}: {
  value: MediaValue | null;
  onChange: (value: FormValue) => void;
  withCaption?: boolean;
  urlOnly?: boolean;
  allowRemove?: boolean;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const media = value ?? { url: '', alt: '', caption: '' };
  const set = (patch: Partial<MediaValue>) => onChange({ ...media, ...patch });

  async function upload(file: File) {
    setUploading(true);
    setUploadError('');
    try {
      const result = await adminApi.upload(file);
      set({ url: result.url });
    } catch (error) {
      setUploadError(error instanceof ApiError ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  return (
    <div className="flex gap-3 border border-line bg-bg p-3">
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden bg-surface">
        {media.url ? (
          // Plain <img>: previews may point at any uploaded URL before it is saved.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.url} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-mono text-[10px] text-subtle">No image</span>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <input aria-label="Image URL" placeholder="https://… or upload" value={media.url} onChange={(e) => set({ url: e.target.value })} className={inputClass} />
        {!urlOnly && <input aria-label="Alt text" placeholder="Alt text (describe the image)" value={media.alt} onChange={(e) => set({ alt: e.target.value })} className={inputClass} />}
        {withCaption && <input aria-label="Caption" placeholder="Caption (optional)" value={media.caption} onChange={(e) => set({ caption: e.target.value })} className={inputClass} />}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <button type="button" className={smallButton} disabled={uploading} onClick={() => fileInput.current?.click()}>
            {uploading ? 'Uploading…' : 'Upload image'}
          </button>
          {allowRemove && media.url && (
            <button type="button" className={smallButton} onClick={() => onChange(urlOnly ? { url: '', alt: '', caption: '' } : null)}>
              Remove
            </button>
          )}
          <span className="text-xs text-subtle">JPEG, PNG, WebP, AVIF or GIF, max 5 MB</span>
        </div>
        {uploadError && <p className="text-xs text-red-300">{uploadError}</p>}
      </div>
    </div>
  );
}
