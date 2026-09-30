/** Shapes returned by the Express API (see backend/src/models). */

export type ContentStatus = 'draft' | 'published';

export interface Media {
  url: string;
  alt?: string;
  caption?: string;
}

export interface ProjectCard {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  technologies: string[];
  thumbnail: Media | null;
  featured: boolean;
  order: number;
  year?: string;
  client?: string;
  results: { label: string; value: string }[];
}

export interface Project extends ProjectCard {
  fullDescription: string;
  role: string;
  problem: string;
  solution: string;
  features: string[];
  architecture: string;
  images: Media[];
  video: string;
  liveUrl: string;
  githubUrl: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectLink {
  title: string;
  slug: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  features: string[];
  technologies: string[];
  order: number;
}

export interface Testimonial {
  id: string;
  clientName: string;
  company: string;
  role: string;
  testimonial: string;
  profileImage: string;
  rating: number;
  featured: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  icon: string;
  proficiency: number | null;
  experience: string;
  order: number;
}

export type ExperienceKind = 'work' | 'education' | 'certification' | 'recognition' | 'international';

export interface Experience {
  id: string;
  kind: ExperienceKind;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  summary: string;
  highlights: string[];
  order: number;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  availability: { available: boolean; label: string };
  profile: {
    name: string;
    role: string;
    headline: string;
    intro: string;
    about: string;
    photoUrl: string;
    photoAlt: string;
  };
  stats: { value: string; label: string; icon?: string }[];
  contactEmail: string;
  location: string;
  resumeUrl: string;
  socials: { label: string; url: string }[];
  projectCategories: string[];
  projectTypes: string[];
  budgetOptions: string[];
  timelineOptions: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  image: Media;
  location: string;
  year: string;
  order: number;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: { path: string; message: string }[] | unknown };
}
