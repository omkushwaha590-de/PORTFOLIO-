import 'dotenv/config';
import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),

    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:3000')
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim().replace(/\/$/, ''))
          .filter(Boolean),
      ),

    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('8h'),
    COOKIE_SAMESITE: z.enum(['strict', 'lax', 'none']).default('lax'),
    COOKIE_DOMAIN: optionalString,

    LOGIN_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
    LOGIN_LOCK_MINUTES: z.coerce.number().int().positive().default(15),

    RESEND_API_KEY: optionalString,
    EMAIL_FROM: optionalString,
    ADMIN_NOTIFY_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),

    TURNSTILE_SECRET_KEY: optionalString,

    /** Shared secret between the frontend and this API (see middleware/client-ip.ts). */
    INTERNAL_API_KEY: z.preprocess(emptyToUndefined, z.string().min(32, 'INTERNAL_API_KEY must be at least 32 characters').optional()),

    STORAGE_DRIVER: z.enum(['local', 'vercel-blob', 'cloudinary']).default('local'),
    UPLOAD_MAX_MB: z.coerce.number().positive().max(20).default(5),
    PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
    CLOUDINARY_CLOUD_NAME: optionalString,
    CLOUDINARY_API_KEY: optionalString,
    CLOUDINARY_API_SECRET: optionalString,
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_DRIVER === 'cloudinary') {
      for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] as const) {
        if (!env[key]) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `${key} is required when STORAGE_DRIVER=cloudinary` });
        }
      }
    }
    // Serverless hosts have an ephemeral, read-only file system: uploads must go to object storage.
    if (env.NODE_ENV === 'production' && env.STORAGE_DRIVER === 'local') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['STORAGE_DRIVER'],
        message: 'STORAGE_DRIVER=local is not supported in production; use vercel-blob or cloudinary',
      });
    }
    if (env.COOKIE_SAMESITE === 'none' && env.NODE_ENV !== 'production') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_SAMESITE'],
        message: 'COOKIE_SAMESITE=none requires HTTPS; only use it in production',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast: never boot with a missing or weak secret.
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export type Env = typeof env;
