import { Schema, model, type InferSchemaType } from 'mongoose';
import { toJSONOptions } from './shared';

export const MESSAGE_STATUSES = ['new', 'read', 'replied', 'archived'] as const;

const messageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    projectType: { type: String, trim: true, default: '' },
    budget: { type: String, trim: true, default: '' },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: MESSAGE_STATUSES, default: 'new', index: true },
    /** Private admin notes; never exposed publicly. */
    notes: { type: String, default: '' },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

messageSchema.index({ createdAt: -1 });

export type MessageDoc = InferSchemaType<typeof messageSchema>;
export const Message = model('Message', messageSchema);
