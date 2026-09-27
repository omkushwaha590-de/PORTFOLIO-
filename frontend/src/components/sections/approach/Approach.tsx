import { Container } from '@/components/ui/Container';
import { SectionHeading, delay } from '@/components/ui/SectionHeading';
import { STEPS } from './steps';

/** DMAIC + Sustain as a static, scannable grid — no scroll-driven effects. */
export function Approach() {
  return (
    <section id="approach" aria-labelledby="approach-title" className="bg-bg-alt py-20 sm:py-28">
      <Container>
        <SectionHeading
          index="04"
          label="Approach"
          id="approach-title"
          title="How I solve problems."
          description="The Six Sigma DMAIC cycle, with one step most programmes skip: sustaining the result."
        />

        <ol className="mt-14 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.name} data-reveal="rise" style={delay((index % 3) * 100)} className="group border-t border-line py-7">
              <p className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-2xl font-semibold tracking-[-0.02em] transition-colors duration-300 group-hover:text-accent">
                  {step.name}
                </span>
              </p>
              <h3 className="mt-4 font-medium text-fg">{step.lead}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">{step.body}</p>
              <p className="mt-4 font-mono text-[11px] text-subtle">{step.outputs.join(' / ')}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
