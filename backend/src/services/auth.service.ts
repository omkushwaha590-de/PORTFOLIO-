import bcrypt from 'bcryptjs';
import type { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';
import { env, isProduction } from '../config/env';
import { logger } from '../config/logger';
import { Admin } from '../models/admin.model';
import { AppError } from '../utils/app-error';
import { escapeHtml } from '../utils/escape-html';
import { mailer } from './email.service';

export const SESSION_COOKIE = isProduction ? '__Host-admin_session' : 'admin_session';
const BCRYPT_ROUNDS = 12;
const JWT_ISSUER = 'portfolio-api';
const JWT_AUDIENCE = 'portfolio-admin';

// Compared against when the email is unknown so response time doesn't reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync('timing-safe-dummy-password', BCRYPT_ROUNDS);

interface SessionPayload {
  sub: string;
  ver: number;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function signSessionToken(adminId: string, tokenVersion: number): { token: string; maxAgeMs: number } {
  const token = jwt.sign({ ver: tokenVersion }, env.JWT_SECRET, {
    subject: adminId,
    algorithm: 'HS256',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  const decoded = jwt.decode(token) as { iat: number; exp: number };
  return { token, maxAgeMs: (decoded.exp - decoded.iat) * 1000 };
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as jwt.JwtPayload;
    if (typeof payload.sub !== 'string' || typeof payload.ver !== 'number') return null;
    return { sub: payload.sub, ver: payload.ver };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeMs?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: env.COOKIE_SAMESITE,
    path: '/',
    // `__Host-` cookies must not set a domain.
    ...(!isProduction && env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
    ...(maxAgeMs !== undefined ? { maxAge: maxAgeMs } : {}),
  };
}

const INVALID_CREDENTIALS = 'Invalid email or password';

/**
 * Verifies credentials with per-account lockout after repeated failures.
 * Error messages are deliberately generic.
 */
export async function authenticate(email: string, password: string) {
  const admin = await Admin.findOne({ email }).select('+passwordHash +failedLoginAttempts +lockUntil');

  if (!admin) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw AppError.unauthorized(INVALID_CREDENTIALS);
  }

  if (admin.lockUntil && admin.lockUntil.getTime() > Date.now()) {
    throw AppError.tooManyRequests('Too many failed attempts. Please try again later.');
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    const attempts = (admin.lockUntil ? 0 : admin.failedLoginAttempts) + 1;
    const lock = attempts >= env.LOGIN_MAX_ATTEMPTS;
    await Admin.updateOne(
      { _id: admin._id },
      {
        $set: {
          failedLoginAttempts: lock ? 0 : attempts,
          lockUntil: lock ? new Date(Date.now() + env.LOGIN_LOCK_MINUTES * 60_000) : null,
        },
      },
    );
    throw AppError.unauthorized(INVALID_CREDENTIALS);
  }

  await Admin.updateOne(
    { _id: admin._id },
    { $set: { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() } },
  );

  return admin;
}

export async function changePassword(adminId: string, currentPassword: string, newPassword: string) {
  const admin = await Admin.findById(adminId).select('+passwordHash');
  if (!admin) throw AppError.unauthorized();

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) throw AppError.badRequest('Current password is incorrect');

  admin.passwordHash = await hashPassword(newPassword);
  admin.tokenVersion += 1; // signs out every existing session
  await admin.save();
  return admin;
}

export async function changeEmail(adminId: string, currentPassword: string, newEmail: string) {
  const admin = await Admin.findById(adminId).select('+passwordHash');
  if (!admin) throw AppError.unauthorized();

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) throw AppError.badRequest('Current password is incorrect');
  if (admin.email === newEmail) throw AppError.badRequest('That is already your login email');

  admin.email = newEmail; // unique index → 409 if another account uses it
  admin.tokenVersion += 1; // signs out every other session
  await admin.save();
  return admin;
}

const RESET_TOKEN_MINUTES = 30;
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/**
 * Emails a one-time password-reset link if `email` belongs to the admin. Callers always show the
 * same response, so the endpoint never reveals which emails exist.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const admin = await Admin.findOne({ email });
  if (!admin) return;

  const token = randomBytes(32).toString('hex');
  await Admin.updateOne(
    { _id: admin._id },
    { $set: { resetTokenHash: hashToken(token), resetTokenExpires: new Date(Date.now() + RESET_TOKEN_MINUTES * 60_000) } },
  );

  const siteUrl = (env.SITE_URL ?? env.CORS_ORIGINS[0] ?? '').replace(/\/$/, '');
  const link = `${siteUrl}/admin/reset-password?token=${token}`;
  const sent = await mailer.send({
    to: admin.email,
    subject: 'Reset your portfolio admin password',
    text: `Someone asked to reset the password for your portfolio admin.\n\nReset it here (valid for ${RESET_TOKEN_MINUTES} minutes, single use):\n${link}\n\nIf this wasn't you, ignore this email; your password stays the same.`,
    html: `<p>Someone asked to reset the password for your portfolio admin.</p><p><a href="${escapeHtml(link)}">Reset your password</a> (valid for ${RESET_TOKEN_MINUTES} minutes, single use).</p><p>If this wasn't you, ignore this email; your password stays the same.</p>`,
  });
  if (!sent) logger.warn('Password reset requested but the email could not be sent (is RESEND_API_KEY set?)');
}

/** Sets a new password from a valid, unexpired reset token; the token then stops working. */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const admin = await Admin.findOne({ resetTokenHash: hashToken(token) }).select('+resetTokenHash +resetTokenExpires');
  if (!admin || !admin.resetTokenExpires || admin.resetTokenExpires.getTime() < Date.now()) {
    throw AppError.badRequest('This reset link is invalid or has expired. Please request a new one.');
  }
  await Admin.updateOne(
    { _id: admin._id },
    {
      $set: {
        passwordHash: await hashPassword(newPassword),
        resetTokenHash: null,
        resetTokenExpires: null,
        failedLoginAttempts: 0,
        lockUntil: null,
      },
      $inc: { tokenVersion: 1 }, // sign out every existing session
    },
  );
}

/** Invalidates every token issued to this admin. */
export async function revokeAllSessions(adminId: string) {
  await Admin.updateOne({ _id: adminId }, { $inc: { tokenVersion: 1 } });
}
