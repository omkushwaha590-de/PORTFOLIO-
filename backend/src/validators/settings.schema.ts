import { z } from 'zod';
import { httpUrl, imageSrc, optionalUrl, requiredText, stringList, text } from './common';

export const settingsUpdateBody = z
  .object({
    siteName: requiredText(120).optional(),
    tagline: text(300).optional(),
    availability: z
      .object({
        available: z.boolean(),
        label: text(120),
      })
      .strict()
      .optional(),
    profile: z
      .object({
        name: text(120),
        role: text(160),
        headline: text(200),
        intro: text(1_000),
        about: text(10_000),
        photoUrl: imageSrc,
        photoAlt: text(200),
      })
      .strict()
      .optional(),
    stats: z
      .array(z.object({ value: requiredText(20), label: requiredText(80) }).strict())
      .max(8)
      .optional(),
    contactEmail: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
    location: text(120).optional(),
    resumeUrl: optionalUrl.optional(),
    socials: z
      .array(z.object({ label: requiredText(40), url: httpUrl }).strict())
      .max(12)
      .optional(),
    projectCategories: stringList(30, 60).min(1).optional(),
    projectTypes: stringList(30, 80).min(1).optional(),
    budgetOptions: stringList(20, 80).min(1).optional(),
    timelineOptions: stringList(20, 80).min(1).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');
