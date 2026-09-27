import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectVisual } from '@/components/projects/ProjectVisual';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { getProject } from '@/lib/api/server';
import { isRenderableImage } from '@/lib/images';
import { paragraphs } from '@/lib/utils';

export async function generateMetadata({ params }: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProject(slug);
  if (!result) return { title: 'Project not found' };
  return {
    title: result.project.title,
    description: result.project.shortDescription,
    openGraph: isRenderableImage(result.project.thumbnail?.url) ? { images: [result.project.thumbnail!.url] } : undefined,
  };
}

/** One row of the case study: label in the left column, content in the right. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-10 lg:grid-cols-12 lg:gap-8">
      <h2 className="text-sm font-semibold lg:col-span-3">{label}</h2>
      <div className="lg:col-span-9">{children}</div>
    </section>
  );
}

function Prose({ text }: { text: string }) {
  return (
    <div className="max-w-3xl space-y-5 text-base leading-relaxed text-muted text-pretty sm:text-lg">
      {paragraphs(text).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

export default async function ProjectPage({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params;
  const result = await getProject(slug);
  if (!result) notFound();
  const { project, previous, next } = result;

  const gallery = project.images.filter((image) => isRenderableImage(image.url));

  const meta = [
    { label: 'Category', value: project.category },
    { label: 'Organisation', value: project.client },
    { label: 'Role', value: project.role },
    { label: 'Year', value: project.year },
  ].filter((item) => item.value);

  return (
    <article className="pt-14 pb-12 sm:pt-20">
      <Container>
        <Link href="/projects" className="font-mono text-xs text-muted hover:text-fg">
          ← All projects
        </Link>

        <header className="mt-8">
          <h1 className="max-w-5xl text-[clamp(2.25rem,6vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance">
            {project.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted text-pretty">{project.shortDescription}</p>

          {meta.length > 0 && (
            <dl className="mt-12 grid grid-cols-2 gap-x-8 lg:grid-cols-4">
              {meta.map((item) => (
                <div key={item.label} className="border-t border-fg py-4">
                  <dt className="font-mono text-[11px] text-subtle uppercase">{item.label}</dt>
                  <dd className="mt-1.5 text-sm">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {isRenderableImage(project.thumbnail?.url) && (
            <ProjectVisual project={project} priority className="mt-10 aspect-[16/9]" />
          )}
        </header>

        <div className="mt-12">
          {project.results.length > 0 && (
            <Row label="Results">
              <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                {project.results.map((item) => (
                  <div key={item.label} className="flex flex-col-reverse justify-end">
                    <dt className="mt-2 text-sm text-muted">{item.label}</dt>
                    <dd className="tabular text-5xl font-semibold tracking-[-0.04em]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Row>
          )}
          {project.fullDescription && (
            <Row label="Overview">
              <Prose text={project.fullDescription} />
            </Row>
          )}
          {project.problem && (
            <Row label="Problem">
              <Prose text={project.problem} />
            </Row>
          )}
          {project.solution && (
            <Row label="Solution">
              <Prose text={project.solution} />
            </Row>
          )}
          {project.features.length > 0 && (
            <Row label="Key elements">
              <ul className="max-w-3xl space-y-2 text-fg/90">
                {project.features.map((feature) => (
                  <li key={feature} className="grid grid-cols-[1rem_1fr]">
                    <span aria-hidden className="text-subtle">–</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </Row>
          )}
          {project.technologies.length > 0 && (
            <Row label="Methods & tools">
              <p className="text-fg/90">{project.technologies.join(', ')}</p>
            </Row>
          )}
          {project.architecture && (
            <Row label="How it works">
              <Prose text={project.architecture} />
            </Row>
          )}
          {gallery.length > 0 && (
            <Row label="Images">
              <ul className="grid gap-6 sm:grid-cols-2">
                {gallery.map((image) => (
                  <li key={image.url}>
                    <figure>
                      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                        <Image src={image.url} alt={image.alt || ''} fill sizes="(min-width: 640px) 40vw, 100vw" className="object-cover" />
                      </div>
                      {image.caption && <figcaption className="mt-2 text-sm text-muted">{image.caption}</figcaption>}
                    </figure>
                  </li>
                ))}
              </ul>
            </Row>
          )}
          {(project.video || project.liveUrl || project.githubUrl) && (
            <Row label="Links">
              <ul className="space-y-2">
                {[
                  { href: project.video, label: 'Video demonstration' },
                  { href: project.liveUrl, label: 'Live' },
                  { href: project.githubUrl, label: 'Source' },
                ]
                  .filter((link) => link.href)
                  .map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-line-strong underline-offset-4 hover:decoration-accent"
                      >
                        {link.label} ↗
                      </a>
                    </li>
                  ))}
              </ul>
            </Row>
          )}

          <Row label="Next step">
            <p className="max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-balance">
              Facing a similar challenge in your organisation?
            </p>
            <ButtonLink href="/collaborate" className="mt-6">
              Get in touch
            </ButtonLink>
          </Row>
        </div>

        {(previous || next) && (
          <nav aria-label="More projects" className="grid grid-cols-2 gap-8 border-t border-fg pt-6">
            <div>
              {previous && (
                <Link href={`/projects/${previous.slug}`} className="group block">
                  <p className="font-mono text-xs text-subtle">← Previous</p>
                  <p className="mt-2 font-medium group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">
                    {previous.title}
                  </p>
                </Link>
              )}
            </div>
            <div className="text-right">
              {next && (
                <Link href={`/projects/${next.slug}`} className="group block">
                  <p className="font-mono text-xs text-subtle">Next →</p>
                  <p className="mt-2 font-medium group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">
                    {next.title}
                  </p>
                </Link>
              )}
            </div>
          </nav>
        )}
      </Container>
    </article>
  );
}
