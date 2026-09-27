const map: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape untrusted text before interpolating it into HTML (e.g. notification emails). */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => map[char] ?? char);
}
