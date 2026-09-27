import { Schema, model, type InferSchemaType } from 'mongoose';
import { CONTENT_STATUSES, toJSONOptions } from './shared';

const testimonialSchema = new Schema(
  {
    clientName: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: '' },
    role: { type: String, trim: true, default: '' },
    testimonial: { type: String, required: true, trim: true },
    profileImage: { type: String, trim: true, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: CONTENT_STATUSES, default: 'draft' },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

testimonialSchema.index({ status: 1, order: 1 });

export type TestimonialDoc = InferSchemaType<typeof testimonialSchema>;
export const Testimonial = model('Testimonial', testimonialSchema);
