import { Schema } from 'mongoose';

export const CONTENT_STATUSES = ['draft', 'published'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export interface Media {
  url: string;
  alt?: string;
  caption?: string;
}

export const mediaSchema = new Schema<Media>(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, default: '' },
    caption: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

/** Exposes `id` instead of `_id` and hides internal fields in every JSON response. */
export const toJSONOptions = {
  virtuals: true,
  versionKey: false,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    delete ret._id;
    return ret;
  },
};
