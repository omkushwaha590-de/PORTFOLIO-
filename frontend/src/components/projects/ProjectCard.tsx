import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ProjectCard as ProjectCardType } from '@/types/api';
import { ProjectVisual } from './ProjectVisual';

interface Props {
  project: ProjectCardType;
  index: number;
  className?: string;
  priority?: boolean;
}

export function ProjectCard({ project, index, className, priority }: Props) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-cursor-label="View"
      className={cn(
        'group flex h-full flex-col transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1',
        className,
      )}
    >
      <ProjectVisual project={project} index={index} priority={priority} className="aspect-[16/10]" />

      <div className="flex flex-1 flex-col border-b border-line pt-5 pb-6">
        <h3 className="text-xl font-semibold tracking-[-0.015em] text-balance sm:text-2xl">
          <span className="link-draw pb-0.5">{project.title}</span>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">{project.shortDescription}</p>
        {project.technologies.length > 0 && (
          <p className="mt-4 font-mono text-[11px] text-subtle">{project.technologies.slice(0, 4).join(' / ')}</p>
        )}
        <p className="mt-auto inline-flex items-center gap-1 pt-5 text-sm text-fg transition-colors duration-300 group-hover:text-accent">
          Case study
          <ArrowUpRight
            aria-hidden
            className="size-4 text-accent transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </p>
      </div>
    </Link>
  );
}
