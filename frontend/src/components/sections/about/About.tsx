import { Container } from '@/components/ui/Container';
import { SectionHeading, delay } from '@/components/ui/SectionHeading';
import { paragraphs } from '@/lib/utils';
import type { Experience, SiteSettings, Skill } from '@/types/api';

interface AboutProps {
  settings: SiteSettings;
  experience: Experience[];
  skills: Skill[];
}

export function About({ settings, experience, skills }: AboutProps) {
  const { profile } = settings;
  const currentRole = experience.find((entry) => entry.kind === 'work' && entry.current);
  const currentStudy = experience.find((entry) => entry.kind === 'education' && entry.current);
  const certifications = experience.filter((entry) => entry.kind === 'certification' && entry.title !== 'Member');
  const languages = skills.filter((skill) => skill.category === 'Languages').map((skill) => skill.name);

  const facts = [
    currentRole && { label: 'Current role', value: `${currentRole.title.split(' — ')[0]}, ${currentRole.organization}` },
    currentStudy && { label: 'Education', value: `${currentStudy.title.split(' (')[0]}, ${currentStudy.organization}` },
    certifications.length > 0 && {
      label: 'Certifications',
      value: certifications.map((entry) => [entry.title, entry.organization].filter(Boolean).join(', ')).join('; '),
    },
    settings.location && { label: 'Location', value: settings.location },
    languages.length > 0 && { label: 'Languages', value: languages.join(', ') },
  ].filter(Boolean) as { label: string; value: string }[];

  // First sentence becomes the section statement; everything after it is body copy.
  const text = paragraphs(profile.about).join('\n\n');
  const split = text.search(/[.!?](\s|$)/);
  const lead = split > 0 ? text.slice(0, split + 1) : text;
  const rest = paragraphs(split > 0 ? text.slice(split + 1) : '');

  return (
    <section id="about" aria-labelledby="about-title" className="bg-bg-alt py-20 sm:py-28">
      <Container>
        <SectionHeading index="01" label="About" id="about-title" title={lead || 'About'} />

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="hidden lg:col-span-3 lg:block" />

          <div className="space-y-5 text-base leading-relaxed text-muted text-pretty sm:text-lg lg:col-span-5">
            {rest.map((paragraph, index) => (
              <p key={index} data-reveal="rise" style={delay(index * 110)}>
                {paragraph}
              </p>
            ))}
          </div>

          {facts.length > 0 && (
            <dl className="lg:col-span-4">
              {facts.map((fact, index) => (
                <div
                  key={fact.label}
                  data-reveal="rise"
                  style={delay(120 + index * 90)}
                  className="group border-t border-line py-4 first:border-t-fg"
                >
                  <dt className="font-mono text-[11px] text-subtle uppercase transition-colors duration-300 group-hover:text-accent">
                    {fact.label}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-fg transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
    </section>
  );
}
