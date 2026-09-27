import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Skill } from '@/types/api';

export function Toolkit({ skills }: { skills: Skill[] }) {
  const technical = skills.filter((skill) => skill.category !== 'Languages');
  if (technical.length === 0) return null;

  const groups = Object.entries(
    technical.reduce<Record<string, string[]>>((acc, skill) => {
      (acc[skill.category] ??= []).push(skill.name);
      return acc;
    }, {}),
  );

  return (
    <section aria-labelledby="toolkit-title" className="py-20 sm:py-28">
      <Container>
        <SectionHeading index="05" label="Toolkit" id="toolkit-title" title="Methods, standards and tools." />

        <dl className="mt-14 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map(([category, items]) => (
            <div key={category} className="border-t border-fg py-5">
              <dt className="text-sm font-semibold">{category}</dt>
              <dd className="mt-4">
                <ul className="space-y-1.5 text-sm text-muted">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
