import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function NotFound() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <p className="font-mono text-xs text-muted">404</p>
        <h1 className="mt-6 text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.92] font-semibold tracking-[-0.05em]">Page not found</h1>
        <p className="mt-8 max-w-md text-muted">The page you were looking for does not exist or has moved.</p>
        <ButtonLink href="/" variant="secondary" className="mt-10">
          Back to home
        </ButtonLink>
      </Container>
    </section>
  );
}
