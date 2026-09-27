import { z } from 'zod';
import { optionalUrl, requiredText, status, text, toUpdateSchema } from './common';

export const testimonialCreateBody = z
  .object({
    clientName: requiredText(120),
    company: text(120).default(''),
    role: text(120).default(''),
    testimonial: requiredText(2_000),
    profileImage: optionalUrl.default(''),
    rating: z.number().int().min(1).max(5).default(5),
    featured: z.boolean().default(false),
    order: z.number().int().min(0).max(100_000).default(0),
    status: status.default('draft'),
  })
  .strict();

export const testimonialUpdateBody = toUpdateSchema(testimonialCreateBody);
