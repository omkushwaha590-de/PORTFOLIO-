/**
 * next/image throws for hosts not listed in next.config `images.remotePatterns`, and the CSP only
 * allows the same hosts. Admin-entered URLs are therefore checked before rendering: anything else is
 * skipped instead of breaking the page. Keep this list in sync with next.config.ts and src/proxy.ts.
 */
export function isRenderableImage(src: string | null | undefined): src is string {
  if (!src) return false;
  if (/^\/(?!\/)/.test(src)) return true; // file shipped in /public
  try {
    const url = new URL(src);
    if (url.protocol === 'https:' && url.hostname === 'res.cloudinary.com') return true;
    if (url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com')) return true;
    if (process.env.NODE_ENV === 'development' && url.origin === 'http://localhost:4000' && url.pathname.startsWith('/uploads/')) {
      return true;
    }
  } catch {
    // not a valid URL
  }
  return false;
}
