/**
 * First-start setup for a brand-new database (used by the serverless entry point).
 *
 * - Starter content is loaded only when the database has never been initialised: no profile name in
 *   settings AND no projects, expertise or experience. Once a profile exists this never runs again, so
 *   content deleted in the admin stays deleted. (A default settings document may already exist, because
 *   reading settings creates one.)
 * - An admin is created from ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD only while no admin exists.
 *   Remove ADMIN_SEED_PASSWORD from the environment after the first sign-in.
 * - Login recovery: ADMIN_RESET_ID + ADMIN_RESET_PASSWORD (+ optional ADMIN_RESET_EMAIL) replace the
 *   admin's password (and email). Each reset id is applied exactly once and recorded on the admin, so a
 *   restart never overwrites a password changed later in the dashboard.
 */
import { z } from 'zod';
import { logger } from '../config/logger';
import { Admin } from '../models/admin.model';
import { Experience } from '../models/experience.model';
import { Project } from '../models/project.model';
import { Service } from '../models/service.model';
import { Settings } from '../models/settings.model';
import { hashPassword } from '../services/auth.service';
import { strongPassword } from '../validators/auth.schema';
import { seedContent } from './seed-content';

const adminSeed = z.object({
  ADMIN_SEED_EMAIL: z.string().trim().toLowerCase().email(),
  ADMIN_SEED_NAME: z.string().trim().min(1).max(80).default('Admin'),
  ADMIN_SEED_PASSWORD: strongPassword,
});

const loginReset = z.object({
  ADMIN_RESET_ID: z.string().trim().min(8).max(100),
  ADMIN_RESET_PASSWORD: strongPassword,
  ADMIN_RESET_EMAIL: z.preprocess((value) => (value === '' ? undefined : value), z.string().trim().toLowerCase().email().optional()),
});

export async function bootstrap(): Promise<{ seeded: boolean; adminCreated: boolean; loginReset: boolean }> {
  let seeded = false;
  let adminCreated = false;
  let loginResetApplied = false;

  const settings = await Settings.findOne({ key: 'site' }).lean();
  const counts = await Promise.all([Project.countDocuments(), Service.countDocuments(), Experience.countDocuments()]);
  const uninitialised = !settings?.profile?.name && counts.every((count) => count === 0);

  if (uninitialised) {
    const log = await seedContent();
    log.forEach((line) => logger.info(`bootstrap: ${line}`));
    seeded = true;
  }

  if ((await Admin.countDocuments()) === 0) {
    const parsed = adminSeed.safeParse(process.env);
    if (parsed.success) {
      const { ADMIN_SEED_EMAIL: email, ADMIN_SEED_NAME: name, ADMIN_SEED_PASSWORD: password } = parsed.data;
      try {
        await Admin.create({ email, name, passwordHash: await hashPassword(password) });
        adminCreated = true;
        logger.info('bootstrap: admin account created — remove ADMIN_SEED_PASSWORD from the environment');
      } catch (error) {
        // A parallel instance may have created it first (unique email index).
        if ((error as { code?: number }).code !== 11000) throw error;
      }
    } else if (process.env.ADMIN_SEED_EMAIL || process.env.ADMIN_SEED_PASSWORD) {
      logger.warn('bootstrap: ADMIN_SEED_* is set but invalid (password must be 12+ chars with upper, lower, number, symbol)');
    }
  }

  if (process.env.ADMIN_RESET_ID || process.env.ADMIN_RESET_PASSWORD) {
    const parsed = loginReset.safeParse(process.env);
    if (!parsed.success) {
      logger.warn('bootstrap: ADMIN_RESET_* is set but invalid (password must be 12+ chars with upper, lower, number, symbol)');
    } else {
      const { ADMIN_RESET_ID: resetId, ADMIN_RESET_PASSWORD: password, ADMIN_RESET_EMAIL: email } = parsed.data;
      const admin = await Admin.findOne().sort({ createdAt: 1 }).select('+lastResetId');
      if (admin && admin.lastResetId !== resetId) {
        const update: Record<string, unknown> = {
          passwordHash: await hashPassword(password),
          failedLoginAttempts: 0,
          lockUntil: null,
          lastResetId: resetId,
          ...(email ? { email } : {}),
        };
        // Conditional on the id so parallel instances apply the reset only once.
        const result = await Admin.updateOne(
          { _id: admin._id, lastResetId: admin.lastResetId ?? null },
          { $set: update, $inc: { tokenVersion: 1 } },
        );
        loginResetApplied = result.modifiedCount === 1;
        if (loginResetApplied) logger.info('bootstrap: admin login reset applied — remove ADMIN_RESET_PASSWORD from the environment');
      }
    }
  }

  return { seeded, adminCreated, loginReset: loginResetApplied };
}
