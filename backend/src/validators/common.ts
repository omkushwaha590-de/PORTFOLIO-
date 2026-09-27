import { z } from 'zod';
import { CONTENT_STATUSES } from '../models/shared';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
export const idParams = z.object({ id: objectId });
export const slugParams = z.object({ slug: z.string().trim().min(1).max(120) });

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers and hyphens');

/** Plain text field. Content is stored as text and must be rendered as text (never as raw HTML). */
export const text = (max: number) => z.string().trim().max(max);
export const requiredText = (max: number) => z.string().trim().min(1, 'Required').max(max);

/** Only http(s) URLs — blocks `javascript:`, `data:` and other dangerous schemes. */
export const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .url('Must be a valid URL')
  .refine((value) => /^https?:\/\//i.test(value), 'Only http(s) URLs are allowed');

export const optionalUrl = z.union([httpUrl, z.literal('')]);

/** An http(s) URL or a path to a file shipped with the frontend, e.g. "/images/portrait.jpg". */
export const imageSrc = z.union([
  httpUrl,
  z
    .string()
    .trim()
    .max(300)
    .regex(/^\/(?!\/)[A-Za-z0-9/_.-]+\.(jpe?g|png|webp|avif)$/i, 'Must be an image URL or a site path like /images/photo.jpg'),
  z.literal(''),
]);

export const stringList = (maxItems: number, maxLength: number) =>
  z.array(requiredText(maxLength)).max(maxItems);

export const mediaInput = z
  .object({
    url: httpUrl,
    alt: text(200).default(''),
    caption: text(300).default(''),
  })
  .strict();

export const status = z.enum(CONTENT_STATUSES);

export const booleanQuery = z.enum(['true', 'false']).transform((value) => value === 'true');

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Builds a PATCH schema from a create schema: every field optional, `.default()`s removed
 * (so omitted fields stay untouched), unknown keys rejected, and at least one field required.
 */
export function toUpdateSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  const shape = Object.fromEntries(
    Object.entries(schema.shape).map(([key, field]) => {
      const inner = field instanceof z.ZodDefault ? field.removeDefault() : (field as z.ZodTypeAny);
      return [key, inner.optional()];
    }),
  );
  return z
    .object(shape)
    .strict()
    .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update') as unknown as z.ZodType<
    Partial<z.output<z.ZodObject<T>>>
  >;
}

export const reorderBody = z
  .object({
    ids: z.array(objectId).min(1).max(500),
  })
  .strict();
