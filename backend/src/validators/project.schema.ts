import { z } from 'zod';
import {
  booleanQuery,
  mediaInput,
  optionalUrl,
  paginationQuery,
  requiredText,
  slug,
  status,
  stringList,
  text,
  toUpdateSchema,
} from './common';

export const projectCreateBody = z
  .object({
    title: requiredText(150),
    slug: slug.optional(),
    shortDescription: requiredText(400),
    fullDescription: text(20_000).default(''),
    category: requiredText(60),
    technologies: stringList(40, 60).default([]),

    client: text(150).default(''),
    role: text(150).default(''),
    year: text(20).default(''),
    problem: text(10_000).default(''),
    solution: text(10_000).default(''),
    features: stringList(50, 300).default([]),
    architecture: text(10_000).default(''),
    results: z
      .array(z.object({ label: requiredText(100), value: requiredText(100) }).strict())
      .max(20)
      .default([]),

    thumbnail: mediaInput.nullable().default(null),
    images: z.array(mediaInput).max(30).default([]),
    video: optionalUrl.default(''),
    liveUrl: optionalUrl.default(''),
    githubUrl: optionalUrl.default(''),

    featured: z.boolean().default(false),
    order: z.number().int().min(0).max(100_000).default(0),
    status: status.default('draft'),
  })
  .strict();

export const projectUpdateBody = toUpdateSchema(projectCreateBody);

export const publicProjectListQuery = paginationQuery.extend({
  category: text(60).optional(),
  featured: booleanQuery.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const adminProjectListQuery = paginationQuery.extend({
  category: text(60).optional(),
  status: status.optional(),
  search: text(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
