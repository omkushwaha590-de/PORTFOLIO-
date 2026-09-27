import { cn } from '@/lib/utils';
import { delay } from './SectionHeading';

interface PageTitleProps {
  label: string;
  title: string;
  className?: string;
  titleClassName?: string;
}

/** Large page title for inner pages: the small label and the title rise from a mask on load. */
export function PageTitle({ label, title, className, titleClassName }: PageTitleProps) {
  return (
    <div className={className}>
      <span className="block overflow-hidden">
        <span className="load-rise block font-mono text-xs text-muted">{label}</span>
      </span>
      <h1 className={cn('mt-6 overflow-hidden pb-[0.08em] font-semibold tracking-[-0.05em]', titleClassName)}>
        <span className="load-rise block" style={delay(120)}>
          {title}
        </span>
      </h1>
    </div>
  );
}
