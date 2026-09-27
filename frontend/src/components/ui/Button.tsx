import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'text';

const base =
  'inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'h-11 bg-fg px-5 text-bg hover:bg-accent hover:text-accent-ink',
  secondary: 'h-11 border border-line-strong px-5 text-fg hover:border-fg',
  text: 'text-fg underline decoration-line-strong underline-offset-[6px] hover:decoration-accent',
};

export function buttonClass(variant: Variant = 'primary', className?: string) {
  return cn(base, variants[variant], className);
}

interface ButtonLinkProps extends Omit<React.ComponentProps<typeof Link>, 'className'> {
  variant?: Variant;
  className?: string;
}

export function ButtonLink({ variant = 'primary', className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
