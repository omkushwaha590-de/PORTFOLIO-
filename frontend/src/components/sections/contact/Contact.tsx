import Link from 'next/link';
import { ContactForm } from '@/components/forms/ContactForm';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { SiteSettings } from '@/types/api';

export function Contact({ settings }: { settings: SiteSettings }) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-bg-deep py-20 sm:py-28">
      <Container>
        <SectionHeading index="08" label="Contact" id="contact-title" title="Let’s talk about your quality or operations challenge." />

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-8 lg:col-span-3">
            <p className="text-sm leading-relaxed text-muted">
              Quality systems, supplier development, audits, Six Sigma, strategy or an industry collaboration. Send a
              note and I will reply personally.
            </p>
            <dl className="space-y-5 text-sm">
              {settings.contactEmail && (
                <div>
                  <dt className="font-mono text-[11px] text-subtle uppercase">Email</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${settings.contactEmail}`} className="underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                      {settings.contactEmail}
                    </a>
                  </dd>
                </div>
              )}
              {settings.location && (
                <div>
                  <dt className="font-mono text-[11px] text-subtle uppercase">Location</dt>
                  <dd className="mt-1">{settings.location}</dd>
                </div>
              )}
            </dl>
            <Link href="/collaborate" className="inline-block text-sm underline decoration-line-strong underline-offset-4 hover:decoration-accent">
              Larger engagement? Share the details →
            </Link>
          </div>

          <div className="lg:col-span-9">
            <ContactForm inquiryTypes={settings.projectTypes} />
          </div>
        </div>
      </Container>
    </section>
  );
}
