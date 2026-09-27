import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { pad } from '@/lib/utils';
import type { Service } from '@/types/api';

/** Numbered, ruled list, like an index in a technical report. */
export function Expertise({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <section id="expertise" aria-labelledby="expertise-title" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          index="02"
          label="Expertise"
          id="expertise-title"
          title="Engineering depth, with a view of the business."
          description="Six areas where I lead, advise and deliver results."
        />

        <ol className="mt-14 border-b border-line">
          {services.map((service, index) => (
            <li
              key={service.id}
              className="grid gap-4 border-t border-line py-8 transition-colors hover:bg-surface lg:grid-cols-12 lg:gap-8 lg:px-0"
            >
              <p className="font-mono text-xs text-subtle lg:col-span-1">{pad(index)}</p>
              <div className="lg:col-span-4">
                <h3 className="text-xl font-semibold tracking-[-0.015em] sm:text-2xl">{service.title}</h3>
              </div>
              <div className="lg:col-span-4">
                <p className="leading-relaxed text-muted text-pretty">{service.description || service.shortDescription}</p>
              </div>
              {service.features.length > 0 && (
                <ul className="space-y-1 text-sm text-fg/85 lg:col-span-3">
                  {service.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
