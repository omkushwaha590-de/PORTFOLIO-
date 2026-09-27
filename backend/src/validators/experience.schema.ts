import { z } from 'zod';
import { EXPERIENCE_KINDS } from '../models/experience.model';
import { requiredText, status, stringList, text, toUpdateSchema } from './common';

export const experienceCreateBody = z
  .object({
    kind: z.enum(EXPERIENCE_KINDS),
    title: requiredText(200),
    organization: text(200).default(''),
    location: text(120).default(''),
    startDate: text(40).default(''),
    endDate: text(40).default(''),
    current: z.boolean().default(false),
    summary: text(5_000).default(''),
    highlights: stringList(30, 500).default([]),
    order: z.number().int().min(0).max(100_000).default(0),
    status: status.default('published'),
  })
  .strict();

export const experienceUpdateBody = toUpdateSchema(experienceCreateBody);
