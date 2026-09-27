import path from 'node:path';
import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Hide the Next.js developer badge in the corner during development.
  devIndicators: false,
  // Pin the project root: a stray lockfile in the user's home folder otherwise makes Turbopack
  // treat the entire home directory as the workspace.
  turbopack: { root: path.resolve(__dirname) },

  // The browser only ever talks to this origin: src/proxy.ts relays /api/v1/* to the Express backend.
  // This keeps the admin session cookie first-party (SameSite=Lax) and hides the backend URL.

  images: {
    // WebP only: in-process AVIF encoding is slow and was observed to stall a request indefinitely.
    formats: ['image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      // Vercel Blob (admin image uploads in production)
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
      // Local uploads from the dev backend
      ...(isDev ? [{ protocol: 'http' as const, hostname: 'localhost', port: '4000', pathname: '/uploads/**' }] : []),
    ],
    // Needed only to optimise images served by the local dev backend.
    dangerouslyAllowLocalIP: isDev,
  },

  // Static security headers. The Content-Security-Policy (with a per-request nonce) is set in src/proxy.ts.
  async headers() {
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
    ];
    return [{ source: '/:path*', headers: security }];
  },
};

export default nextConfig;
