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

/** Delay for staggered reveals, as a CSS custom property. */
export const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

/**
 * Swiss-style section header: a hairline rule that draws across, a small numbered label in the left
 * column, and the title in the wide right column rising into place.
 */
export function SectionHeading({ index, label, title, description, id, className, aside }: SectionHeadingProps) {
  return (
    <header className={cn('relative grid gap-6 pt-6 lg:grid-cols-12 lg:gap-8', className)}>
      <div aria-hidden data-reveal="line" className="absolute inset-x-0 top-0 h-px bg-line-strong" />
      <p data-reveal="rise" className="font-mono text-xs text-muted lg:col-span-3">
        <span className="text-accent">{index}</span>
        <span className="ml-3">{label}</span>
      </p>
      <div className="lg:col-span-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id={id}
            data-reveal="rise"
            style={delay(90)}
            className="max-w-3xl text-3xl leading-[1.1] font-semibold tracking-[-0.025em] text-balance sm:text-[2.75rem]"
          >
            {title}
          </h2>
          {aside && (
            <div data-reveal="rise" style={delay(180)}>
              {aside}
            </div>
          )}
        </div>
        {description && (
          <p data-reveal="rise" style={delay(180)} className="mt-5 max-w-2xl text-base leading-relaxed text-muted text-pretty">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
