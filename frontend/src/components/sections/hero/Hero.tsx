import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { delay } from '@/components/ui/SectionHeading';
import { isRenderableImage } from '@/lib/images';
import type { Service, SiteSettings } from '@/types/api';
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

export function Hero({ settings, services }: { settings: SiteSettings; services: Service[] }) {
  const { profile, stats } = settings;
  const name = profile.name || settings.siteName;
  const words = name.split(/\s+/);

  return (
    <section aria-labelledby="hero-name" className="pt-14 pb-20 sm:pt-20 sm:pb-28">
      <Container>
        {profile.role && (
          <Rise ms={0}>
            <span className="font-mono text-xs text-muted">{profile.role}</span>
          </Rise>
        )}

        <h1
          id="hero-name"
          className="group mt-6 w-fit text-[clamp(3.25rem,11.5vw,9.5rem)] leading-[0.88] font-semibold tracking-[-0.055em]"
        >
          <span className="sr-only">{name}</span>
          {/* Each word rises from its own mask, one after another. */}
          {words.map((word, index) => (
            <span key={`${word}-${index}`} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <span className="load-rise inline-block" style={delay(120 + index * 110)}>
                {/* Gold sweeps through the name on hover, word after word (same motion as the buttons). */}
                <span className="text-sweep" style={{ '--sweep-delay': `${index * 90}ms` } as React.CSSProperties}>
                  {word}
                </span>
                {index < words.length - 1 && ' '}
              </span>
            </span>
          ))}
        </h1>

        <div className="relative mt-14 grid gap-10 pt-8 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <div aria-hidden className="load-line absolute inset-x-0 top-0 h-px bg-line-strong" style={delay(450)} />

          {services.length > 0 && (
            <ul className="space-y-1.5 text-sm text-muted lg:col-span-3" aria-label="Focus areas">
              {services.slice(0, 6).map((service, index) => (
                <li key={service.id}>
                  <Rise ms={600 + index * 60}>{service.title}</Rise>
                </li>
              ))}
            </ul>
          )}

          <div className="lg:col-span-5">
            {profile.headline && (
              <Rise ms={650}>
                <span className="block max-w-2xl text-2xl leading-[1.2] font-medium tracking-[-0.02em] text-balance sm:text-[1.9rem]">
                  {profile.headline}
                </span>
              </Rise>
            )}
            {profile.intro && (
              <Rise ms={780} className="mt-6">
                <span className="block max-w-xl text-base leading-relaxed text-muted text-pretty">{profile.intro}</span>
              </Rise>
            )}
            {/* Extra padding keeps the buttons' focus outline outside the mask. */}
            <Rise ms={900} className="-mx-1.5 mt-8.5 px-1.5 pt-1.5">
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
            <div className="load-wipe order-first max-w-sm lg:order-none lg:col-span-4 lg:max-w-none" style={delay(350)}>
              <TiltPortrait src={profile.photoUrl} alt={profile.photoAlt || name} name={name} role={profile.role} />
            </div>
          )}
        </div>

        {stats.length > 0 && (
          <dl className="mt-20 grid grid-cols-2 gap-x-4 sm:gap-x-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={stat.label} className="relative flex flex-col-reverse justify-end py-5">
                <div aria-hidden data-reveal="line" className="absolute inset-x-0 top-0 h-px bg-fg" style={delay(index * 120)} />
                <dt data-reveal="rise" style={delay(150 + index * 120)} className="mt-2 text-sm leading-snug text-muted">
                  {stat.label}
                </dt>
                <dd data-reveal="rise" style={delay(80 + index * 120)} className="tabular text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Container>
    </section>
  );
}
