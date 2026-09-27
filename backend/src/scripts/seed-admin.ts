/**
 * Creates the admin account from ADMIN_SEED_* environment variables.
 *   npm run seed:admin            create if missing
 *   npm run seed:admin -- --reset reset the password of an existing admin (signs out all sessions)
 * Remove ADMIN_SEED_PASSWORD from .env afterwards.
 */
import { z } from 'zod';
import { env } from '../config/env';
import { connectDatabase, disconnectDatabase } from '../config/db';
import { Admin } from '../models/admin.model';
import { hashPassword } from '../services/auth.service';
import { strongPassword } from '../validators/auth.schema';

const seedSchema = z.object({
  ADMIN_SEED_EMAIL: z.string().trim().toLowerCase().email('ADMIN_SEED_EMAIL must be a valid email'),
  ADMIN_SEED_NAME: z.string().trim().min(1).max(80).default('Admin'),
  ADMIN_SEED_PASSWORD: strongPassword,
});

async function main() {
  const parsed = seedSchema.safeParse(process.env);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    process.exit(1);
  }
  const { ADMIN_SEED_EMAIL: email, ADMIN_SEED_NAME: name, ADMIN_SEED_PASSWORD: password } = parsed.data;
  const reset = process.argv.includes('--reset');

  await connectDatabase(env.MONGODB_URI);
  try {
    const existing = await Admin.findOne({ email });
    if (existing && !reset) {
      console.log(`Admin ${email} already exists. Use --reset to change its password.`);
      return;
    }

    const passwordHash = await hashPassword(password);
    if (existing) {
      await Admin.updateOne(
        { _id: existing._id },
        { $set: { passwordHash, failedLoginAttempts: 0, lockUntil: null }, $inc: { tokenVersion: 1 } },
      );
      console.log(`Password reset for ${email}. All sessions were signed out.`);
    } else {
      await Admin.create({ email, name, passwordHash });
      console.log(`Admin ${email} created.`);
    }
    console.log('Now remove ADMIN_SEED_PASSWORD from your .env file.');
  } finally {
    await disconnectDatabase();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
