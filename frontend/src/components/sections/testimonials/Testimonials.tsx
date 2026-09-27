import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Testimonial } from '@/types/api';

/** Shown only when real, published testimonials exist. Nothing is ever shown as a placeholder. */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-title" className="py-20 sm:py-28">
      <Container>
        <SectionHeading index="07" label="References" id="testimonials-title" title="What colleagues say." />
        <ul className="mt-14 grid gap-x-8 md:grid-cols-2">
          {testimonials.map((item) => (
            <li key={item.id} className="border-t border-line py-8">
              <figure>
                <blockquote className="text-lg leading-relaxed text-fg text-pretty sm:text-xl">“{item.testimonial}”</blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="font-semibold">{item.clientName}</span>
                  {(item.role || item.company) && (
                    <span className="text-muted">, {[item.role, item.company].filter(Boolean).join(', ')}</span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
