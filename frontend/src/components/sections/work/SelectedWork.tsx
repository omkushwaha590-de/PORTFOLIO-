import { ProjectCard } from '@/components/projects/ProjectCard';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { ProjectCard as ProjectCardType } from '@/types/api';

export function SelectedWork({ projects, total }: { projects: ProjectCardType[]; total: number }) {
  if (projects.length === 0) return null;

  return (
    <section id="work" aria-labelledby="work-title" className="bg-bg-deep py-20 sm:py-28">
      <Container>
        <SectionHeading
          index="03"
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
            <li key={project.id}>
              <ProjectCard project={project} index={index} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
