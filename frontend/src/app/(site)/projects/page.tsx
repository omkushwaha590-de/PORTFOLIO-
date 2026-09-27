import type { Metadata } from 'next';
import { FilterableProjects } from '@/components/projects/FilterableProjects';
import { Container } from '@/components/ui/Container';
import { PageTitle } from '@/components/ui/PageTitle';
import { getProjects, getSettings } from '@/lib/api/server';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Quality systems, supplier development, Six Sigma, digitalisation and sustainability projects.',
};

export default async function ProjectsPage({ searchParams }: PageProps<'/projects'>) {
  const { category } = await searchParams;
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);

  return (
    <section className="pt-14 pb-12 sm:pt-20">
      <Container>
        <PageTitle label="Work" title="Projects" titleClassName="text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.92]" />
        <p data-reveal="rise" className="mt-8 max-w-2xl text-lg leading-relaxed text-muted text-pretty">
          Programmes and tools that improved quality, reduced variation and removed waste.
        </p>
        <div data-reveal="rise" className="mt-14">
          {projects.length > 0 ? (
            <FilterableProjects
              projects={projects}
              categories={settings.projectCategories}
              initialCategory={typeof category === 'string' ? category : 'All'}
            />
          ) : (
            <p className="text-muted">Projects will be published here soon.</p>
          )}
        </div>
      </Container>
    </section>
  );
}
