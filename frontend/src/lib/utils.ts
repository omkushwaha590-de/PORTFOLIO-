export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Splits admin-entered plain text into paragraphs. Content is always rendered as text, never HTML. */
export function paragraphs(text: string | undefined): string[] {
  return (text ?? '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function pad(index: number): string {
  return String(index + 1).padStart(2, '0');
}
