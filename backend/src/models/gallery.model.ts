import { Schema, model, type InferSchemaType } from 'mongoose';
import { CONTENT_STATUSES, mediaSchema, toJSONOptions } from './shared';

/** Photo gallery item (events, visits, awards, team moments). */
const galleryItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: mediaSchema, required: true },
    location: { type: String, trim: true, default: '' },
    year: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    status: { type: String, enum: CONTENT_STATUSES, default: 'published' },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

galleryItemSchema.index({ status: 1, order: 1 });

export type GalleryItemDoc = InferSchemaType<typeof galleryItemSchema>;
export const GalleryItem = model('GalleryItem', galleryItemSchema);
