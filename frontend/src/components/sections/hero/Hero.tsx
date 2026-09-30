import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { delay } from '@/components/ui/SectionHeading';
import { StatIcon } from '@/components/ui/StatIcon';
import { isRenderableImage } from '@/lib/images';
import type { SiteSettings } from '@/types/api';
import { TiltPortrait } from './TiltPortrait';

/** Masked line that rises into place on page load (pure CSS, see .load-rise in globals.css). */
function Rise({ ms, className, children }: { ms: number; className?: string; children: React.ReactNode }) {
  return (
    <span className={`block overflow-hidden ${className ?? ''}`}>
      <span className="load-rise block" style={delay(ms)}>
        {children}
      </span>
    </span>
  );
}

export function Hero({ settings }: { settings: SiteSettings }) {
  const { profile, stats } = settings;
  const name = profile.name || settings.siteName;
  const headline = profile.headline || name;
  const words = headline.split(/\s+/);

  return (
    <section aria-labelledby="hero-title" className="screen-section py-12 sm:py-16">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Rise ms={0}>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
                <span className="text-fg">{name}</span>
                {profile.role && (
                  <>
                    <span aria-hidden className="h-px w-6 bg-accent" />
                    <span>{profile.role}</span>
                  </>
                )}
              </span>
            </Rise>

            {/* The headline is the page's main statement; each word rises from its own mask. */}
            <h1
              id="hero-title"
              className="group mt-7 text-[clamp(2.2rem,3.9vw,3.6rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-balance"
            >
              <span className="sr-only">{headline}</span>
              {words.map((word, index) => (
                <span key={`${word}-${index}`} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                  <span className="load-rise inline-block" style={delay(120 + index * 55)}>
                    {/* Gold sweeps through the words on hover, like the buttons' fill. */}
                    <span className="text-sweep" style={{ '--sweep-delay': `${index * 40}ms` } as React.CSSProperties}>
                      {word}
                    </span>
                    {index < words.length - 1 && ' '}
                  </span>
                </span>
              ))}
            </h1>

            {profile.intro && (
              <Rise ms={650} className="mt-7">
                <span className="block max-w-xl text-base leading-relaxed text-muted text-pretty sm:text-lg">{profile.intro}</span>
              </Rise>
            )}

            {/* Extra padding keeps the buttons' focus outline outside the mask. */}
            <Rise ms={800} className="-mx-1.5 mt-8.5 px-1.5 pt-1.5">
              <span className="flex flex-wrap items-center gap-x-6 gap-y-4 pb-1">
                <ButtonLink href="/#work">
                  View work
                  <ArrowDownRight aria-hidden className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:translate-y-0.5" />
                </ButtonLink>
                <ButtonLink href="/collaborate" variant="secondary">
                  Get in touch
                  <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </ButtonLink>
                {settings.resumeUrl && (
                  <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer" className="link-draw text-sm text-muted hover:text-fg">
                    Download CV
                  </a>
                )}
              </span>
            </Rise>
          </div>

          {isRenderableImage(profile.photoUrl) && (
            <div className="load-wipe order-first mx-auto w-full max-w-xs sm:max-w-sm lg:order-none lg:col-span-5 lg:max-w-sm" style={delay(300)}>
              <TiltPortrait src={profile.photoUrl} alt={profile.photoAlt || name} name={name} role={profile.role} />
            </div>
          )}
        </div>

        {stats.length > 0 && (
          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:mt-14 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={stat.label} data-reveal="rise" style={delay(index * 110)} className="group flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center border border-line-strong text-accent transition-[border-color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-rotate-6 group-hover:border-accent">
                  <StatIcon icon={stat.icon} label={stat.label} className="size-5" />
                </span>
                <div className="flex flex-col-reverse">
                  <dt className="mt-1.5 text-sm leading-snug text-muted">{stat.label}</dt>
                  <dd className="tabular text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{stat.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </Container>
    </section>
  );
}
