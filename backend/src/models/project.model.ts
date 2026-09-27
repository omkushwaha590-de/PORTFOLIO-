import { Schema, model, type InferSchemaType } from 'mongoose';
import { CONTENT_STATUSES, mediaSchema, toJSONOptions } from './shared';

const resultSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, default: '' },
    category: { type: String, required: true, trim: true, index: true },
    technologies: { type: [String], default: [] },

    // Case-study sections for /projects/[slug]
    client: { type: String, trim: true, default: '' },
    role: { type: String, trim: true, default: '' },
    year: { type: String, trim: true, default: '' },
    problem: { type: String, default: '' },
    solution: { type: String, default: '' },
    features: { type: [String], default: [] },
    architecture: { type: String, default: '' },
    results: { type: [resultSchema], default: [] },

    thumbnail: { type: mediaSchema, default: null },
    images: { type: [mediaSchema], default: [] },
    video: { type: String, trim: true, default: '' },
    liveUrl: { type: String, trim: true, default: '' },
    githubUrl: { type: String, trim: true, default: '' },

    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: CONTENT_STATUSES, default: 'draft' },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

projectSchema.index({ status: 1, order: 1 });

export type ProjectDoc = InferSchemaType<typeof projectSchema>;
export const Project = model('Project', projectSchema);
