import { Schema, model, type InferSchemaType } from 'mongoose';
import { CONTENT_STATUSES, toJSONOptions } from './shared';

/** Career timeline entries: roles, education, certifications, recognitions and international exposure. */
export const EXPERIENCE_KINDS = ['work', 'education', 'certification', 'recognition', 'international'] as const;

const experienceSchema = new Schema(
  {
    kind: { type: String, enum: EXPERIENCE_KINDS, required: true, index: true },
    title: { type: String, required: true, trim: true },
    organization: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    /** Display strings such as "Feb 2017" / "Present" — kept as text for flexible formatting. */
    startDate: { type: String, trim: true, default: '' },
    endDate: { type: String, trim: true, default: '' },
    current: { type: Boolean, default: false },
    summary: { type: String, default: '' },
    highlights: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    status: { type: String, enum: CONTENT_STATUSES, default: 'published' },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

experienceSchema.index({ status: 1, kind: 1, order: 1 });

export type ExperienceDoc = InferSchemaType<typeof experienceSchema>;
export const Experience = model('Experience', experienceSchema);
