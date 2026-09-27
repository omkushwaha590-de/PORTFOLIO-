import type { SiteSettings } from '@/types/api';

/** Minimal settings used only if the API is unreachable, so the layout still renders. */
export const fallbackSettings: SiteSettings = {
  siteName: 'Yogesh N Modi',
  tagline: '',
  availability: { available: false, label: '' },
  profile: { name: 'Yogesh N Modi', role: '', headline: '', intro: '', about: '', photoUrl: '', photoAlt: '' },
  stats: [],
  contactEmail: '',
  location: '',
  resumeUrl: '',
  socials: [],
  projectCategories: [],
  projectTypes: [],
  budgetOptions: [],
  timelineOptions: [],
};
