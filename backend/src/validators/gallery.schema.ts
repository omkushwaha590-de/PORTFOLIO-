import { z } from 'zod';
import { imageSrc, requiredText, status, text, toUpdateSchema } from './common';

export const galleryCreateBody = z
  .object({
    title: requiredText(150),
    image: z
      .object({
        url: imageSrc.refine((value) => value !== '', 'An image is required'),
        alt: text(200).default(''),
        caption: text(300).default(''),
      })
      .strict(),
    location: text(120).default(''),
    year: text(20).default(''),
    order: z.number().int().min(0).max(100_000).default(0),
    status: status.default('published'),
  })
  .strict();

export const galleryUpdateBody = toUpdateSchema(galleryCreateBody);
