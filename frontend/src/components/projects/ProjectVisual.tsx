import Image from 'next/image';
import { isRenderableImage } from '@/lib/images';
import { cn } from '@/lib/utils';
import type { ProjectCard } from '@/types/api';

/**
 * Project cover. Uses the uploaded thumbnail when there is one; otherwise a flat typographic cover
 * showing the headline result (or the category) instead of decorative artwork.
 */
export function ProjectVisual({
  project,
  index,
  className,
  priority,
}: {
  project: ProjectCard;
  index?: number;
  className?: string;
  priority?: boolean;
}) {
  const metric = project.results?.[0];

  if (isRenderableImage(project.thumbnail?.url)) {
    return (
      <div className={cn('relative overflow-hidden bg-surface', className)}>
        <Image
          src={project.thumbnail!.url}
          alt={project.thumbnail!.alt || project.title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden bg-surface p-5 transition-colors duration-500 group-hover:bg-surface-2 sm:p-6',
        className,
      )}
    >
      <div className="flex justify-between font-mono text-[11px] text-subtle">
        <span>{project.category}</span>
        {index !== undefined && <span>{String(index + 1).padStart(2, '0')}</span>}
      </div>
      {metric ? (
        <div>
          <p className="tabular text-5xl font-semibold tracking-[-0.04em] text-fg transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-1 sm:text-6xl">
            {metric.value}
          </p>
          <p className="mt-2 text-sm text-muted">{metric.label}</p>
        </div>
      ) : (
        <div aria-hidden className="h-1 w-12 bg-accent transition-[width] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:w-24" />
      )}
    </div>
  );
}
