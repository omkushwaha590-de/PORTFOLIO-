import { z } from 'zod';
import { MESSAGE_STATUSES } from '../models/message.model';
import { QUOTE_STATUSES } from '../models/quote.model';
import { paginationQuery, requiredText, stringList, text } from './common';

const email = z.string().trim().toLowerCase().max(254).email('Enter a valid email address');
const phone = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+\d\s()-]*$/, 'Enter a valid phone number')
  .default('');
/** Cloudflare Turnstile token from the widget; verified server-side. */
const turnstileToken = z.string().max(4096).optional();

export const contactBody = z
  .object({
    name: requiredText(120),
    email,
    phone,
    company: text(120).default(''),
    projectType: text(80).default(''),
    budget: text(80).default(''),
    message: requiredText(5_000),
    turnstileToken,
    // Honeypot: real users never see or fill this field.
    website: z.string().max(200).optional(),
  })
  .strict();

export const quoteBody = z
  .object({
    name: requiredText(120),
    email,
    company: text(120).default(''),
    projectType: requiredText(80),
    budget: text(80).default(''),
    timeline: text(80).default(''),
    description: requiredText(10_000),
    requirements: stringList(30, 300).default([]),
    turnstileToken,
    website: z.string().max(200).optional(),
  })
  .strict();

export const messageListQuery = paginationQuery.extend({
  status: z.enum(MESSAGE_STATUSES).optional(),
});

export const quoteListQuery = paginationQuery.extend({
  status: z.enum(QUOTE_STATUSES).optional(),
});

export const messageUpdateBody = z
  .object({
    status: z.enum(MESSAGE_STATUSES).optional(),
    notes: text(5_000).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

export const quoteUpdateBody = z
  .object({
    status: z.enum(QUOTE_STATUSES).optional(),
    notes: text(5_000).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');
