import { Schema, model, type InferSchemaType } from 'mongoose';
import { CONTENT_STATUSES, toJSONOptions } from './shared';

const skillSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    /** Icon name or image URL resolved by the frontend. */
    icon: { type: String, trim: true, default: '' },
    /** 0–100, optional. */
    proficiency: { type: Number, min: 0, max: 100, default: null },
    /** Free text such as "8+ years". */
    experience: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    status: { type: String, enum: CONTENT_STATUSES, default: 'published' },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

skillSchema.index({ status: 1, order: 1 });

export type SkillDoc = InferSchemaType<typeof skillSchema>;
export const Skill = model('Skill', skillSchema);
