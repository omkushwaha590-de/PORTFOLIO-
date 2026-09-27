import { z } from 'zod';
import { requiredText, slug, status, stringList, text, toUpdateSchema } from './common';

export const serviceCreateBody = z
  .object({
    title: requiredText(120),
    slug: slug.optional(),
    shortDescription: requiredText(300),
    description: text(5_000).default(''),
    icon: z
      .string()
      .trim()
      .max(60)
      .regex(/^[A-Za-z0-9-]*$/, 'Icon must be an icon name, not markup')
      .default(''),
    features: stringList(30, 200).default([]),
    technologies: stringList(30, 60).default([]),
    order: z.number().int().min(0).max(100_000).default(0),
    status: status.default('draft'),
  })
  .strict();

export const serviceUpdateBody = toUpdateSchema(serviceCreateBody);
