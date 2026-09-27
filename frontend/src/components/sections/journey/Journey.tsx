import { Container } from '@/components/ui/Container';
import { SectionHeading, delay } from '@/components/ui/SectionHeading';
import type { Experience, ExperienceKind } from '@/types/api';

function period(entry: Experience): string {
  const end = entry.current ? 'Present' : entry.endDate;
  if (entry.startDate && end) return `${entry.startDate} – ${end}`;
  return entry.startDate || end || '';
}

const GROUPS: { kind: ExperienceKind; title: string }[] = [
  { kind: 'education', title: 'Education' },
  { kind: 'certification', title: 'Certifications & memberships' },
  { kind: 'international', title: 'International exposure' },
  { kind: 'recognition', title: 'Recognition' },
];

export function Journey({ experience }: { experience: Experience[] }) {
  if (experience.length === 0) return null;
  const roles = experience.filter((entry) => entry.kind === 'work');

  return (
    <section id="journey" aria-labelledby="journey-title" className="bg-bg-alt py-20 sm:py-28">
      <Container>
        <SectionHeading index="06" label="Experience" id="journey-title" title="Sixteen years in industrial manufacturing." />

        {roles.length > 0 && (
          <ol className="mt-14">
            {roles.map((role) => (
              <li key={role.id} data-reveal="rise" className="grid gap-4 border-t border-line py-10 lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-3">
                  <p className="tabular font-mono text-xs text-fg">{period(role)}</p>
                  {role.location && <p className="mt-1 font-mono text-xs text-subtle">{role.location}</p>}
                </div>
                <div className="lg:col-span-9">
                  <h3 className="text-xl font-semibold tracking-[-0.015em] text-balance sm:text-2xl">{role.title}</h3>
                  <p className="mt-1 text-accent">{role.organization}</p>
                  {role.summary && <p className="mt-4 max-w-2xl leading-relaxed text-muted text-pretty">{role.summary}</p>}
                  {role.highlights.length > 0 && (
                    <ul className="mt-5 max-w-2xl space-y-2 text-sm leading-relaxed text-fg/85">
                      {role.highlights.map((highlight) => (
                        <li key={highlight} className="grid grid-cols-[1rem_1fr]">
                          <span aria-hidden className="text-subtle">–</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-10 grid gap-x-8 md:grid-cols-2">
          {GROUPS.map(({ kind, title }, groupIndex) => {
            const entries = experience.filter((entry) => entry.kind === kind);
            if (entries.length === 0) return null;
            return (
              <div key={kind} data-reveal="rise" style={delay((groupIndex % 2) * 120)} className="border-t border-fg pt-5 pb-10">
                <h3 className="text-sm font-semibold">{title}</h3>
                <ul className="mt-4">
                  {entries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-start justify-between gap-6 border-t border-line py-4 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:translate-x-1"
                    >
                      <div>
                        <p className="text-fg">{entry.title}</p>
                        {(entry.organization || entry.location) && (
                          <p className="mt-0.5 text-sm text-muted">{[entry.organization, entry.location].filter(Boolean).join(', ')}</p>
                        )}
                        {entry.summary && kind !== 'education' && (
                          <p className="mt-2 text-sm leading-relaxed text-subtle">{entry.summary}</p>
                        )}
                      </div>
                      {period(entry) && <p className="tabular shrink-0 font-mono text-xs text-muted">{period(entry)}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
