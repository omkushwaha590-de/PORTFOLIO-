import { Schema, model, type InferSchemaType } from 'mongoose';
import { toJSONOptions } from './shared';

const linkSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

/** Icons an admin can pick for a home-page figure ('' = choose automatically from the label). */
export const STAT_ICONS = ['calendar', 'target', 'shield', 'globe', 'award', 'factory', 'users', 'chart', 'leaf', 'briefcase'] as const;

/**
 * Single-document collection holding site-wide, admin-editable configuration.
 * Form option lists live here so business decisions are not hardcoded in the UI.
 */
const settingsSchema = new Schema(
  {
    key: { type: String, default: 'site', unique: true, immutable: true },
    siteName: { type: String, trim: true, default: 'Portfolio' },
    tagline: { type: String, trim: true, default: '' },
    availability: {
      available: { type: Boolean, default: true },
      label: { type: String, trim: true, default: 'Available for new projects' },
    },
    /** Hero / about content. */
    profile: {
      name: { type: String, trim: true, default: '' },
      role: { type: String, trim: true, default: '' },
      headline: { type: String, trim: true, default: '' },
      intro: { type: String, default: '' },
      about: { type: String, default: '' },
      photoUrl: { type: String, trim: true, default: '' },
      photoAlt: { type: String, trim: true, default: '' },
    },
    /** Headline numbers shown on the home page, e.g. { value: "16+", label: "Years of experience" }. */
    stats: { type: [new Schema({ value: String, label: String, icon: { type: String, default: '' } }, { _id: false })], default: [] },

    contactEmail: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    resumeUrl: { type: String, trim: true, default: '' },
    socials: { type: [linkSchema], default: [] },

    projectCategories: {
      type: [String],
      default: ['Quality Systems', 'Supplier Quality', 'Six Sigma', 'Digital Solutions', 'Sustainability'],
    },
    /** Options for the "type of inquiry" field on the contact and collaboration forms. */
    projectTypes: {
      type: [String],
      default: [
        'Quality Transformation',
        'Supplier Quality Development',
        'Audit & Compliance (ISO)',
        'Six Sigma / Problem Solving',
        'Training & Mentoring',
        'Speaking / Industry Collaboration',
        'Career Opportunity',
        'Other',
      ],
    },
    budgetOptions: { type: [String], default: ['To be discussed', '<$1,000', '$1,000–$5,000', '$5,000–$10,000', '$10,000+'] },
    timelineOptions: { type: [String], default: ['< 1 month', '1–3 months', '3–6 months', '6+ months', 'Flexible'] },
  },
  { timestamps: true, toJSON: toJSONOptions },
);

export type SettingsDoc = InferSchemaType<typeof settingsSchema>;
export const Settings = model('Settings', settingsSchema);

/** Returns the settings document, creating it with defaults on first access. */
export async function getSettings() {
  return Settings.findOneAndUpdate({ key: 'site' }, { $setOnInsert: { key: 'site' } }, { upsert: true, new: true });
}
