import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'text';

const base =
  'group/btn relative isolate inline-flex items-center justify-center gap-2 overflow-hidden text-sm font-medium transition-[color,border-color] duration-500 disabled:pointer-events-none disabled:opacity-50';

/** Fill that sweeps in from the left on hover (drawn behind the label). */
const sweep =
  "before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-500 before:ease-[cubic-bezier(.22,1,.36,1)] before:content-[''] hover:before:scale-x-100 focus-visible:before:scale-x-100";

const variants: Record<Variant, string> = {
  primary: cn('h-11 bg-fg px-5 text-bg hover:text-accent-ink', sweep, 'before:bg-accent'),
  secondary: cn('h-11 border border-line-strong px-5 text-fg hover:border-fg hover:text-bg', sweep, 'before:bg-fg'),
  text: 'text-fg link-draw pb-0.5 hover:text-accent',
};

export function buttonClass(variant: Variant = 'primary', className?: string) {
  return cn(base, variants[variant], className);
}

interface ButtonLinkProps extends Omit<React.ComponentProps<typeof Link>, 'className'> {
  variant?: Variant;
  className?: string;
}

export function ButtonLink({ variant = 'primary', className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, className)} {...props}>
      {children}
    </Link>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
