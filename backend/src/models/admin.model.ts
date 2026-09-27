import { Schema, model, type InferSchemaType } from 'mongoose';

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true, default: 'Admin' },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin'], default: 'admin' },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },
    /** Incremented on logout-all / password change to invalidate every issued token. */
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: null },
    /** Id of the last login reset applied from ADMIN_RESET_* (see scripts/bootstrap.ts). */
    lastResetId: { type: String, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.passwordHash;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        delete ret.tokenVersion;
        delete ret.lastResetId;
        return ret;
      },
    },
  },
);

export type AdminDoc = InferSchemaType<typeof adminSchema>;
export const Admin = model('Admin', adminSchema);
