'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

export const inputClass =
  'w-full border border-line bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-subtle outline-none transition-colors hover:border-line-strong focus:border-fg aria-[invalid=true]:border-red-400';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (ids: { id: string; describedBy?: string; invalid?: boolean }) => React.ReactNode;
}

/** Label + control + hint/error, wired up for screen readers. */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm text-fg">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>
      {children({ id, describedBy: [hintId, errorId].filter(Boolean).join(' ') || undefined, invalid: Boolean(error) })}
      {hint && (
        <p id={hintId} className="text-xs text-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
