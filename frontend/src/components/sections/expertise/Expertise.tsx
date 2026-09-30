import { Container } from '@/components/ui/Container';
import { SectionHeading, delay } from '@/components/ui/SectionHeading';
import { pad } from '@/lib/utils';
import type { Service } from '@/types/api';

/** Numbered, ruled list, like an index in a technical report. */
export function Expertise({ services, index = '04' }: { services: Service[]; index?: string }) {
  if (services.length === 0) return null;

  return (
    <section id="expertise" aria-labelledby="expertise-title" className="screen-section py-20 sm:py-24">
      <Container>
        <SectionHeading
          index={index}
          label="Expertise"
          id="expertise-title"
          title="Engineering depth, with a view of the business."
          description="Six areas where I lead, advise and deliver results."
        />

        <ol className="mt-14 border-b border-line">
          {services.map((service, index) => (
            <li
              key={service.id}
              data-reveal="rise"
              style={delay((index % 3) * 90)}
              className="group relative grid gap-4 border-t border-line py-8 transition-colors duration-500 hover:bg-surface lg:grid-cols-12 lg:gap-8 lg:px-0"
            >
              <span
                aria-hidden
                className="absolute top-0 bottom-0 left-0 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-y-100"
              />
              <p className="font-mono text-xs text-subtle transition-colors duration-300 group-hover:text-accent lg:col-span-1 lg:pl-3">
                {pad(index)}
              </p>
              <div className="lg:col-span-4">
                <h3 className="text-xl font-semibold tracking-[-0.015em] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-2 sm:text-2xl">
                  {service.title}
                </h3>
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
