import { z } from 'zod';

export const loginBody = z
  .object({
    email: z.string().trim().toLowerCase().max(254).email(),
    password: z.string().min(1).max(200),
  })
  .strict();

/** 12+ chars with upper, lower, digit and symbol. */
export const strongPassword = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(200)
  .regex(/[a-z]/, 'Password needs a lowercase letter')
  .regex(/[A-Z]/, 'Password needs an uppercase letter')
  .regex(/\d/, 'Password needs a number')
  .regex(/[^A-Za-z0-9]/, 'Password needs a symbol');

export const forgotPasswordBody = z
  .object({
    email: z.string().trim().toLowerCase().max(254).email('Enter a valid email address'),
  })
  .strict();

export const resetPasswordBody = z
  .object({
    token: z.string().regex(/^[a-f0-9]{64}$/, 'This reset link is invalid'),
    newPassword: strongPassword,
  })
  .strict();

export const changeEmailBody = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newEmail: z.string().trim().toLowerCase().max(254).email('Enter a valid email address'),
  })
  .strict();

export const changePasswordBody = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: strongPassword,
  })
  .strict()
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'New password must be different',
    path: ['newPassword'],
  });
