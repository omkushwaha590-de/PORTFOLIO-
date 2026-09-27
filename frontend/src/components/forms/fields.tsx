import { useId } from 'react';
import { cn } from '@/lib/utils';

const control =
  'w-full border border-line bg-surface px-3.5 py-3 text-base text-fg placeholder:text-subtle transition-colors outline-none hover:border-line-strong focus:border-fg aria-[invalid=true]:border-red-400 sm:text-sm';

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: (ids: { id: string; describedBy?: string }) => React.ReactNode;
}

function FieldShell({ label, error, hint, optional, className, children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm text-fg/90">
        {label}
        {optional && <span className="font-mono text-[11px] text-subtle">Optional</span>}
      </label>
      {children({ id, describedBy })}
      {hint && !error && (
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

type Common = { label: string; error?: string; hint?: string; optional?: boolean; className?: string };

export function TextField({
  label,
  error,
  hint,
  optional,
  className,
  ...input
}: Common & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={className}>
      {({ id, describedBy }) => (
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          required={!optional}
          className={control}
          {...input}
        />
      )}
    </FieldShell>
  );
}

export function TextArea({
  label,
  error,
  hint,
  optional,
  className,
  ...input
}: Common & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={className}>
      {({ id, describedBy }) => (
        <textarea
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          required={!optional}
          rows={5}
          className={cn(control, 'resize-y')}
          {...input}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  label,
  error,
  hint,
  optional,
  className,
  options,
  placeholder = 'Select…',
  ...select
}: Common & React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[]; placeholder?: string }) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={className}>
      {({ id, describedBy }) => (
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          required={!optional}
          defaultValue=""
          className={cn(control, 'appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10')}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239aa1a9' stroke-width='1.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
          {...select}
        >
          <option value="" disabled={!optional}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

/** Hidden field that only bots fill in. Kept out of the tab order and the accessibility tree. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
