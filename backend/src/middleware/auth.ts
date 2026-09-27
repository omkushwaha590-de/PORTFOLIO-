import type { RequestHandler } from 'express';
import { Admin } from '../models/admin.model';
import { SESSION_COOKIE, verifySessionToken } from '../services/auth.service';
import { AppError } from '../utils/app-error';

/**
 * Server-side authorization for every admin endpoint. The token is verified cryptographically
 * AND checked against the database, so deleted admins and revoked sessions (tokenVersion bump)
 * are rejected immediately.
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== 'string' || !token) throw AppError.unauthorized();

  const payload = verifySessionToken(token);
  if (!payload) throw AppError.unauthorized('Session expired, please sign in again');

  const admin = await Admin.findById(payload.sub).lean();
  if (!admin || admin.tokenVersion !== payload.ver || admin.role !== 'admin') {
    throw AppError.unauthorized('Session expired, please sign in again');
  }

  req.admin = { id: String(admin._id), email: admin.email, role: 'admin' };
  next();
};
