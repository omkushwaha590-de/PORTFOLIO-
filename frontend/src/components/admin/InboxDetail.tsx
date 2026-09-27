'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { adminApi } from '@/lib/admin/client';
import { Field, inputClass } from './Field';
import { Notice } from './ui';

interface Props {
  kind: 'messages' | 'quotes';
  id: string;
  status: string;
  notes: string;
  statuses: readonly string[];
  replyTo: string;
  replySubject: string;
}

/** Status, private notes, reply and delete controls for one inbox item. */
export function InboxDetail({ kind, id, status: initialStatus, notes: initialNotes, statuses, replyTo, replySubject }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.patch(`/${kind}/${id}`, { status, notes });
      setMessage({ kind: 'success', text: 'Saved.' });
      router.refresh();
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof ApiError ? error.message : 'Could not save.' });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this entry permanently? This cannot be undone.')) return;
    try {
      await adminApi.delete(`/${kind}/${id}`);
      router.replace(`/admin/${kind}`);
      router.refresh();
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof ApiError ? error.message : 'Could not delete.' });
    }
  }

  return (
    <div className="space-y-5 border border-line p-5">
      <a
        href={`mailto:${replyTo}?subject=${encodeURIComponent(`Re: ${replySubject}`)}`}
        className="flex h-10 items-center justify-center bg-fg text-sm font-medium text-bg hover:bg-accent hover:text-accent-ink"
      >
        Reply by email
      </a>
      <Field label="Status">
        {({ id: fieldId }) => (
          <select id={fieldId} value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            {statuses.map((option) => (
              <option key={option} value={option}>
                {option[0]!.toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Private notes" hint="Only visible to you.">
        {({ id: fieldId, describedBy }) => (
          <textarea
            id={fieldId}
            aria-describedby={describedBy}
            rows={5}
            maxLength={5000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        )}
      </Field>
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="h-10 flex-1 border border-line-strong text-sm hover:border-fg disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={() => void remove()} className="h-10 border border-line px-4 text-sm text-muted hover:border-red-400 hover:text-red-300">
          Delete
        </button>
      </div>
    </div>
  );
}
