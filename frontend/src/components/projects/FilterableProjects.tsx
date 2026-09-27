'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ProjectCard as ProjectCardType } from '@/types/api';
import { ProjectCard } from './ProjectCard';

const ALL = 'All';

interface Props {
  projects: ProjectCardType[];
  categories: string[];
  initialCategory: string;
}

/** Filters instantly on the client and mirrors the choice in `?category=` so filtered views can be shared. */
export function FilterableProjects({ projects, categories, initialCategory }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const matches = (project: ProjectCardType, category: string) => project.category.toLowerCase() === category.toLowerCase();
  const available = [ALL, ...categories.filter((category) => projects.some((project) => matches(project, category)))];
  const initial = available.find((category) => category.toLowerCase() === initialCategory.toLowerCase()) ?? ALL;
  const [active, setActive] = useState(initial);

  const visible = active === ALL ? projects : projects.filter((project) => matches(project, active));

  function select(category: string) {
    setActive(category);
    router.replace(category === ALL ? pathname : `${pathname}?category=${encodeURIComponent(category)}`, { scroll: false });
  }

  return (
    <>
      <div role="group" aria-label="Filter by category" className="flex flex-wrap border-t border-l border-line">
        {available.map((category) => {
          const selected = category === active;
          const count = category === ALL ? projects.length : projects.filter((project) => matches(project, category)).length;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={selected}
              onClick={() => select(category)}
              className={cn(
                'border-r border-b border-line px-4 py-3 text-sm transition-colors',
                selected ? 'bg-fg text-bg' : 'text-muted hover:bg-surface hover:text-fg',
              )}
            >
              {category} <span className="ml-1 font-mono text-[11px] opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? 'project' : 'projects'}
      </p>

      <ul className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2">
        {visible.map((project, index) => (
          <li key={project.id}>
            <ProjectCard project={project} index={index} priority={index < 2} />
          </li>
        ))}
      </ul>
    </>
  );
}
