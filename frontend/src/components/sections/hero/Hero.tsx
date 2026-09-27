import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { isRenderableImage } from '@/lib/images';
import type { Service, SiteSettings } from '@/types/api';
import { TiltPortrait } from './TiltPortrait';

export function Hero({ settings, services }: { settings: SiteSettings; services: Service[] }) {
  const { profile, stats } = settings;

  return (
    <section aria-labelledby="hero-name" className="pt-14 pb-20 sm:pt-20 sm:pb-28">
      <Container>
        {profile.role && <p className="font-mono text-xs text-muted">{profile.role}</p>}

        <h1
          id="hero-name"
          className="mt-6 text-[clamp(3.25rem,11.5vw,9.5rem)] leading-[0.88] font-semibold tracking-[-0.055em]"
        >
          {profile.name || settings.siteName}
        </h1>

        <div className="mt-14 grid gap-10 border-t border-line pt-8 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          {services.length > 0 && (
            <ul className="space-y-1.5 text-sm text-muted lg:col-span-3" aria-label="Focus areas">
              {services.slice(0, 6).map((service) => (
                <li key={service.id}>{service.title}</li>
              ))}
            </ul>
          )}

          <div className="lg:col-span-5">
            {profile.headline && (
              <p className="max-w-2xl text-2xl leading-[1.2] font-medium tracking-[-0.02em] text-balance sm:text-[1.9rem]">
                {profile.headline}
              </p>
            )}
            {profile.intro && (
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted text-pretty">{profile.intro}</p>
            )}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ButtonLink href="/#work">View work</ButtonLink>
              <ButtonLink href="/collaborate" variant="secondary">
                Get in touch
              </ButtonLink>
              {settings.resumeUrl && (
                <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted underline underline-offset-4 hover:text-fg">
                  Download CV
                </a>
              )}
            </div>
          </div>

          {isRenderableImage(profile.photoUrl) && (
            <div className="order-first max-w-sm lg:order-none lg:col-span-4 lg:max-w-none">
              <TiltPortrait
                src={profile.photoUrl}
                alt={profile.photoAlt || profile.name}
                name={profile.name || settings.siteName}
                role={profile.role}
              />
            </div>
          )}
        </div>

        {stats.length > 0 && (
          <dl className="mt-20 grid grid-cols-2 gap-x-4 sm:gap-x-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse justify-end border-t border-fg py-5">
                <dt className="mt-2 text-sm leading-snug text-muted">{stat.label}</dt>
                <dd className="tabular text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Container>
    </section>
  );
}
