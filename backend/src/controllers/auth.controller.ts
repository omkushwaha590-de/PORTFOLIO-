import type { Request, Response } from 'express';
import { Admin } from '../models/admin.model';
import {
  SESSION_COOKIE,
  authenticate,
  changeEmail,
  changePassword,
  requestPasswordReset,
  resetPassword,
  revokeAllSessions,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
} from '../services/auth.service';
import { isEmailEnabled } from '../services/email.service';
import { AppError } from '../utils/app-error';

/** POST /auth/login — sets an httpOnly session cookie; the token is never exposed to JavaScript. */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const admin = await authenticate(email, password);

  const { token, maxAgeMs } = signSessionToken(String(admin._id), admin.tokenVersion);
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions(maxAgeMs));
  res.json({ data: { admin: { id: String(admin._id), email: admin.email, name: admin.name }, expiresInMs: maxAgeMs } });
}

/** POST /auth/logout — clears the cookie. Pass `{ "everywhere": true }` to revoke all sessions. */
export async function logout(req: Request, res: Response) {
  // Works even with an expired session, so the cookie can always be cleared.
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  const payload = typeof token === 'string' ? verifySessionToken(token) : null;
  if (payload && req.body?.everywhere === true) {
    await revokeAllSessions(payload.sub);
  }
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
  res.status(204).end();
}

/** GET /auth/me */
export async function me(req: Request, res: Response) {
  const admin = await Admin.findById(req.admin?.id);
  if (!admin) throw AppError.unauthorized();
  res.json({ data: admin });
}

/** POST /auth/change-password — rotates the password, revokes old sessions, issues a fresh cookie. */
export async function updatePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  const admin = await changePassword(req.admin!.id, currentPassword, newPassword);

  const { token, maxAgeMs } = signSessionToken(String(admin._id), admin.tokenVersion);
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions(maxAgeMs));
  res.json({ data: { updated: true } });
}

/** POST /auth/change-email — changes the login email, revokes old sessions, issues a fresh cookie. */
export async function updateEmail(req: Request, res: Response) {
  const { currentPassword, newEmail } = req.body as { currentPassword: string; newEmail: string };
  const admin = await changeEmail(req.admin!.id, currentPassword, newEmail);

  const { token, maxAgeMs } = signSessionToken(String(admin._id), admin.tokenVersion);
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions(maxAgeMs));
  res.json({ data: { email: admin.email } });
}

/** POST /auth/forgot-password — always the same answer, whether or not the email exists. */
export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email: string };
  await requestPasswordReset(email);
  res.json({ data: { requested: true, emailEnabled: isEmailEnabled() } });
}

/** POST /auth/reset-password — completes a reset from the emailed link. */
export async function completePasswordReset(req: Request, res: Response) {
  const { token, newPassword } = req.body as { token: string; newPassword: string };
  await resetPassword(token, newPassword);
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
  res.json({ data: { reset: true } });
}
