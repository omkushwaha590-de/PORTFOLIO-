/**
 * First-start setup for a brand-new database (used by the serverless entry point).
 *
 * - Starter content is loaded only when the database has never been initialised: no profile name in
 *   settings AND no projects, expertise or experience. Once a profile exists this never runs again, so
 *   content deleted in the admin stays deleted. (A default settings document may already exist, because
 *   reading settings creates one.)
 * - An admin is created from ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD only while no admin exists.
 *   Remove ADMIN_SEED_PASSWORD from the environment after the first sign-in.
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

export async function bootstrap(): Promise<{ seeded: boolean; adminCreated: boolean }> {
  let seeded = false;
  let adminCreated = false;

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

  return { seeded, adminCreated };
}
