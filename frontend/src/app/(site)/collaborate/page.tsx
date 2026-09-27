import type { Metadata } from 'next';
import { CollaborateForm } from '@/components/forms/CollaborateForm';
import { Container } from '@/components/ui/Container';
import { getSettings } from '@/lib/api/server';

export const metadata: Metadata = {
  title: 'Get in touch',
  description: 'Share the details of an engagement, advisory request or industry collaboration.',
};

const NEXT_STEPS = [
  'I review your inquiry personally.',
  'A short call to understand the context and goals.',
  'A clear proposal for scope, approach and timing.',
];

export default async function CollaboratePage() {
  const settings = await getSettings();

  return (
    <section className="pt-14 pb-12 sm:pt-20">
      <Container>
        <p className="font-mono text-xs text-muted">Get in touch</p>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">
          Tell me about the challenge.
        </h1>

        <div className="mt-16 grid gap-12 border-t border-line pt-8 lg:grid-cols-12 lg:gap-8">
          <aside className="space-y-10 lg:col-span-3">
            <p className="text-sm leading-relaxed text-muted">
              Advisory, training, audits, strategy or an industry collaboration. The more context you share, the more
              useful my reply will be.
            </p>
            <div>
              <h2 className="text-sm font-semibold">What happens next</h2>
              <ol className="mt-4 space-y-3 text-sm text-muted">
                {NEXT_STEPS.map((step, index) => (
                  <li key={step} className="grid grid-cols-[1.75rem_1fr]">
                    <span className="font-mono text-xs text-fg">{String(index + 1).padStart(2, '0')}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            {settings.contactEmail && (
              <p className="text-sm text-muted">
                Or email{' '}
                <a href={`mailto:${settings.contactEmail}`} className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                  {settings.contactEmail}
                </a>
              </p>
            )}
          </aside>

          <div className="lg:col-span-9">
            <CollaborateForm
              options={{
                projectTypes: settings.projectTypes,
                budgetOptions: settings.budgetOptions,
                timelineOptions: settings.timelineOptions,
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
