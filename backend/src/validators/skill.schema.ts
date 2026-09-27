import { z } from 'zod';
import { requiredText, status, text, toUpdateSchema } from './common';

export const skillCreateBody = z
  .object({
    name: requiredText(80),
    category: requiredText(60),
    icon: text(300).default(''),
    proficiency: z.number().int().min(0).max(100).nullable().default(null),
    experience: text(60).default(''),
    order: z.number().int().min(0).max(100_000).default(0),
    status: status.default('published'),
  })
  .strict();

export const skillUpdateBody = toUpdateSchema(skillCreateBody);
