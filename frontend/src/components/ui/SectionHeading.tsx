import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  index: string;
  label: string;
  title: React.ReactNode;
  description?: string;
  id?: string;
  className?: string;
  aside?: React.ReactNode;
}

/**
 * Swiss-style section header: a hairline rule, a small numbered label in the left column,
 * and the title in the wide right column.
 */
export function SectionHeading({ index, label, title, description, id, className, aside }: SectionHeadingProps) {
  return (
    <header className={cn('grid gap-6 border-t border-line pt-6 lg:grid-cols-12 lg:gap-8', className)}>
      <p className="font-mono text-xs text-muted lg:col-span-3">
        <span className="text-fg">{index}</span>
        <span className="ml-3">{label}</span>
      </p>
      <div className="lg:col-span-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 id={id} className="max-w-3xl text-3xl leading-[1.1] font-semibold tracking-[-0.025em] text-balance sm:text-[2.75rem]">
            {title}
          </h2>
          {aside}
        </div>
        {description && <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted text-pretty">{description}</p>}
      </div>
    </header>
  );
}
