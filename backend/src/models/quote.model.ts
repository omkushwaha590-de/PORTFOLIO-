import { Schema, model, type InferSchemaType } from 'mongoose';
import { toJSONOptions } from './shared';

export const QUOTE_STATUSES = ['new', 'reviewing', 'quoted', 'won', 'lost', 'archived'] as const;

const quoteSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, trim: true, default: '' },
    projectType: { type: String, required: true, trim: true },
    budget: { type: String, trim: true, default: '' },
    timeline: { type: String, trim: true, default: '' },
    description: { type: String, required: true, trim: true },
    requirements: { type: [String], default: [] },
    status: { type: String, enum: QUOTE_STATUSES, default: 'new', index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

quoteSchema.index({ createdAt: -1 });

export type QuoteDoc = InferSchemaType<typeof quoteSchema>;
export const Quote = model('Quote', quoteSchema);
