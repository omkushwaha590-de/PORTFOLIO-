import type { SiteSettings } from '@/types/api';

/** Field types understood by the generic admin editor. */
export type FieldDef =
  | { type: 'text' | 'url' | 'email'; name: string; label: string; required?: boolean; max?: number; hint?: string; half?: boolean }
  | { type: 'textarea'; name: string; label: string; required?: boolean; max?: number; rows?: number; hint?: string }
  | { type: 'number'; name: string; label: string; min?: number; max?: number; nullable?: boolean; half?: boolean; hint?: string }
  | { type: 'checkbox'; name: string; label: string; hint?: string }
  | {
      type: 'select';
      name: string;
      label: string;
      required?: boolean;
      half?: boolean;
      hint?: string;
      options: string[] | ((settings: SiteSettings) => string[]);
    }
  | { type: 'list'; name: string; label: string; hint?: string; max?: number }
  | { type: 'pairs'; name: string; label: string; keys: [string, string]; keyLabels: [string, string]; hint?: string }
  | { type: 'media'; name: string; label: string; hint?: string }
  | { type: 'mediaList'; name: string; label: string; hint?: string }
  | { type: 'image'; name: string; label: string; hint?: string };

export interface FieldGroup {
  title: string;
  fields: FieldDef[];
}

export interface ResourceConfig {
  key: string;
  label: string;
  singular: string;
  /** Cache tag(s) on the public site to refresh after changes. */
  tags: string[];
  titleField: string;
  subtitle?: (item: Record<string, unknown>) => string;
  hasStatus: boolean;
  hasFeatured: boolean;
  /** Link to the item on the public site, when it has its own page. */
  publicPath?: (item: Record<string, unknown>) => string | null;
  groups: FieldGroup[];
}

const STATUS: FieldDef = { type: 'select', name: 'status', label: 'Status', options: ['draft', 'published'], half: true };
const ORDER: FieldDef = {
  type: 'number',
  name: 'order',
  label: 'Order',
  min: 0,
  half: true,
  hint: 'Lower numbers appear first. You can also reorder from the list.',
};

export const RESOURCES: Record<string, ResourceConfig> = {
  projects: {
    key: 'projects',
    label: 'Projects',
    singular: 'Project',
    tags: ['projects'],
    titleField: 'title',
    subtitle: (item) => [item.category, item.year].filter(Boolean).join(' · '),
    hasStatus: true,
    hasFeatured: true,
    publicPath: (item) => (item.status === 'published' && item.slug ? `/projects/${String(item.slug)}` : null),
    groups: [
      {
        title: 'Basics',
        fields: [
          { type: 'text', name: 'title', label: 'Title', required: true, max: 150 },
          { type: 'text', name: 'slug', label: 'URL slug', max: 100, hint: 'Leave empty to generate from the title.', half: true },
          { type: 'select', name: 'category', label: 'Category', required: true, half: true, options: (s) => s.projectCategories },
          { type: 'textarea', name: 'shortDescription', label: 'Short description', required: true, max: 400, rows: 3, hint: 'Shown on project cards.' },
          { type: 'list', name: 'technologies', label: 'Methods & tools', hint: 'One per line.' },
        ],
      },
      {
        title: 'Case study',
        fields: [
          { type: 'text', name: 'client', label: 'Organisation', max: 150, half: true },
          { type: 'text', name: 'role', label: 'Your role', max: 150, half: true },
          { type: 'text', name: 'year', label: 'Year', max: 20, half: true },
          { type: 'textarea', name: 'fullDescription', label: 'Overview', rows: 6, max: 20000, hint: 'Separate paragraphs with a blank line.' },
          { type: 'textarea', name: 'problem', label: 'Problem', rows: 5, max: 10000 },
          { type: 'textarea', name: 'solution', label: 'Solution', rows: 5, max: 10000 },
          { type: 'list', name: 'features', label: 'Key elements', hint: 'One per line.' },
          { type: 'textarea', name: 'architecture', label: 'How it works', rows: 5, max: 10000 },
          {
            type: 'pairs',
            name: 'results',
            label: 'Results',
            keys: ['value', 'label'],
            keyLabels: ['Value (e.g. 2,500+)', 'Label (e.g. Supplier PPM reduced)'],
            hint: 'The first result is shown large on the project card.',
          },
        ],
      },
      {
        title: 'Media & links',
        fields: [
          { type: 'media', name: 'thumbnail', label: 'Cover image', hint: 'Optional. Without one, the card shows the first result.' },
          { type: 'mediaList', name: 'images', label: 'Gallery images' },
          { type: 'url', name: 'video', label: 'Video URL', half: true },
          { type: 'url', name: 'liveUrl', label: 'Live URL', half: true },
          { type: 'url', name: 'githubUrl', label: 'Source URL', half: true },
        ],
      },
      {
        title: 'Publishing',
        fields: [STATUS, ORDER, { type: 'checkbox', name: 'featured', label: 'Feature on the home page' }],
      },
    ],
  },

  services: {
    key: 'services',
    label: 'Expertise',
    singular: 'Expertise area',
    tags: ['services'],
    titleField: 'title',
    subtitle: (item) => String(item.shortDescription ?? ''),
    hasStatus: true,
    hasFeatured: false,
    groups: [
      {
        title: 'Content',
        fields: [
          { type: 'text', name: 'title', label: 'Title', required: true, max: 120 },
          { type: 'textarea', name: 'shortDescription', label: 'Short description', required: true, max: 300, rows: 2 },
          { type: 'textarea', name: 'description', label: 'Description', max: 5000, rows: 4, hint: 'Shown in the Expertise list.' },
          { type: 'list', name: 'features', label: 'Key points', hint: 'One per line.' },
        ],
      },
      { title: 'Publishing', fields: [STATUS, ORDER] },
    ],
  },

  testimonials: {
    key: 'testimonials',
    label: 'Testimonials',
    singular: 'Testimonial',
    tags: ['testimonials'],
    titleField: 'clientName',
    subtitle: (item) => [item.role, item.company].filter(Boolean).join(', '),
    hasStatus: true,
    hasFeatured: true,
    groups: [
      {
        title: 'Testimonial',
        fields: [
          { type: 'text', name: 'clientName', label: 'Name', required: true, max: 120, half: true },
          { type: 'text', name: 'role', label: 'Role', max: 120, half: true },
          { type: 'text', name: 'company', label: 'Organisation', max: 120, half: true },
          { type: 'textarea', name: 'testimonial', label: 'Quote', required: true, max: 2000, rows: 5, hint: 'Only publish real quotes, with permission.' },
          { type: 'image', name: 'profileImage', label: 'Photo' },
          { type: 'number', name: 'rating', label: 'Rating (1–5)', min: 1, max: 5, half: true },
        ],
      },
      { title: 'Publishing', fields: [STATUS, ORDER, { type: 'checkbox', name: 'featured', label: 'Featured' }] },
    ],
  },

  skills: {
    key: 'skills',
    label: 'Skills',
    singular: 'Skill',
    tags: ['skills'],
    titleField: 'name',
    subtitle: (item) => String(item.category ?? ''),
    hasStatus: true,
    hasFeatured: false,
    groups: [
      {
        title: 'Skill',
        fields: [
          { type: 'text', name: 'name', label: 'Name', required: true, max: 80, half: true },
          {
            type: 'text',
            name: 'category',
            label: 'Category',
            required: true,
            max: 60,
            half: true,
            hint: 'E.g. Methodologies, Standards, Tools & Analytics, Leadership & Management, Languages.',
          },
          { type: 'text', name: 'experience', label: 'Experience', max: 60, half: true, hint: 'Optional, e.g. "10+ years".' },
          { type: 'number', name: 'proficiency', label: 'Proficiency (0–100)', min: 0, max: 100, nullable: true, half: true },
        ],
      },
      { title: 'Publishing', fields: [STATUS, ORDER] },
    ],
  },

  experience: {
    key: 'experience',
    label: 'Experience',
    singular: 'Experience entry',
    tags: ['experience'],
    titleField: 'title',
    subtitle: (item) =>
      [String(item.kind ?? ''), item.organization, [item.startDate, item.current ? 'Present' : item.endDate].filter(Boolean).join(' – ')]
        .filter(Boolean)
        .join(' · '),
    hasStatus: true,
    hasFeatured: false,
    groups: [
      {
        title: 'Entry',
        fields: [
          {
            type: 'select',
            name: 'kind',
            label: 'Type',
            required: true,
            half: true,
            options: ['work', 'education', 'certification', 'recognition', 'international'],
          },
          { type: 'text', name: 'title', label: 'Title', required: true, max: 200 },
          { type: 'text', name: 'organization', label: 'Organisation', max: 200, half: true },
          { type: 'text', name: 'location', label: 'Location', max: 120, half: true },
          { type: 'text', name: 'startDate', label: 'Start', max: 40, half: true, hint: 'E.g. Feb 2017' },
          { type: 'text', name: 'endDate', label: 'End', max: 40, half: true },
          { type: 'checkbox', name: 'current', label: 'Current (shows "Present")' },
          { type: 'textarea', name: 'summary', label: 'Summary', max: 5000, rows: 3 },
          { type: 'list', name: 'highlights', label: 'Highlights', hint: 'One per line.' },
        ],
      },
      { title: 'Publishing', fields: [STATUS, ORDER] },
    ],
  },
};

export const allFields = (config: ResourceConfig): FieldDef[] => config.groups.flatMap((group) => group.fields);
