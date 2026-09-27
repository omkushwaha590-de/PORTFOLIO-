import { Schema, model, type InferSchemaType } from 'mongoose';
import { CONTENT_STATUSES, toJSONOptions } from './shared';

const serviceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    /** Icon name from the frontend icon set (e.g. a Lucide icon name), never raw SVG/HTML. */
    icon: { type: String, trim: true, default: '' },
    features: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    status: { type: String, enum: CONTENT_STATUSES, default: 'draft' },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

serviceSchema.index({ status: 1, order: 1 });

export type ServiceDoc = InferSchemaType<typeof serviceSchema>;
export const Service = model('Service', serviceSchema);
