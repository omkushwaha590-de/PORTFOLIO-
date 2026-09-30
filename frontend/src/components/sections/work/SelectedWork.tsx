import { ProjectCard } from '@/components/projects/ProjectCard';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionHeading, delay } from '@/components/ui/SectionHeading';
import type { ProjectCard as ProjectCardType } from '@/types/api';

export function SelectedWork({ projects, total, index = '03' }: { projects: ProjectCardType[]; total: number; index?: string }) {
  if (projects.length === 0) return null;

  return (
    <section id="work" aria-labelledby="work-title" className="screen-section bg-bg-deep py-20 sm:py-24">
      <Container>
        <SectionHeading
          index={index}
          label="Selected work"
          id="work-title"
          title="Problems solved, results measured."
          description="Programmes and tools that raised quality, removed errors and reduced waste."
          aside={
            total > projects.length ? (
              <ButtonLink href="/projects" variant="text" className="shrink-0">
                All {total} projects →
              </ButtonLink>
            ) : undefined
          }
        />

        <ul className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-2">
          {projects.map((project, index) => (
            <li key={project.id} data-reveal="rise" style={delay((index % 2) * 120)}>
              <ProjectCard project={project} index={index} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
