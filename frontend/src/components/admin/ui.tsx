import { cn } from '@/lib/utils';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

const badgeTones = {
  neutral: 'border-line text-muted',
  positive: 'border-fg/40 text-fg',
  accent: 'border-accent/60 text-accent',
} as const;

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: keyof typeof badgeTones }) {
  return <span className={cn('inline-block border px-1.5 py-0.5 font-mono text-[10px] uppercase', badgeTones[tone])}>{children}</span>;
}

export function Notice({ kind, children }: { kind: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <p
      role={kind === 'error' ? 'alert' : 'status'}
      className={cn(
        'border-l-2 px-4 py-3 text-sm',
        kind === 'error' ? 'border-red-400 bg-red-400/10 text-red-200' : 'border-fg bg-surface text-fg',
      )}
    >
      {children}
    </p>
  );
}

export function formatDate(value: string | null | undefined, withTime = false): string {
  if (!value) return '';
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
