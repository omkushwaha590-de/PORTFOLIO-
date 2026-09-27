import 'server-only';
import type { Experience, Project, ProjectCard, ProjectLink, Service, SiteSettings, Skill, Testimonial } from '@/types/api';
import { fallbackSettings } from './fallbacks';

const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

/** Public content changes rarely; refresh at most once a minute. */
const REVALIDATE_SECONDS = 60;

/** Identifies this server to the backend (exempt from per-visitor rate limits). */
const INTERNAL_HEADERS: Record<string, string> = process.env.INTERNAL_API_KEY ? { 'x-internal-key': process.env.INTERNAL_API_KEY } : {};


interface Envelope<T, M = unknown> {
  data: T;
  meta?: M;
}

/**
 * Fetches public content from the API on the server. Returns `null` instead of throwing when the
 * API is unreachable, so pages render gracefully (and builds succeed) without the backend.
 */
async function getJson<T, M = unknown>(path: string, tags: string[]): Promise<Envelope<T, M> | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1${path}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags },
      headers: { Accept: 'application/json', ...INTERNAL_HEADERS },
      signal: AbortSignal.timeout(8_000),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`API ${path} responded ${response.status}`);
    return (await response.json()) as Envelope<T, M>;
  } catch (error) {
    console.error(`[api] ${path} failed:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getSettings(): Promise<SiteSettings> {
  const res = await getJson<SiteSettings>('/settings', ['settings']);
  return res?.data ?? fallbackSettings;
}

export async function getProjects(params: { category?: string; featured?: boolean } = {}): Promise<ProjectCard[]> {
  const search = new URLSearchParams({ limit: '100' });
  if (params.category) search.set('category', params.category);
  if (params.featured !== undefined) search.set('featured', String(params.featured));
  const res = await getJson<ProjectCard[]>(`/projects?${search}`, ['projects']);
  return res?.data ?? [];
}

export async function getProject(slug: string) {
  const res = await getJson<Project, { previous: ProjectLink | null; next: ProjectLink | null }>(
    `/projects/${encodeURIComponent(slug)}`,
    ['projects', `project:${slug}`],
  );
  return res ? { project: res.data, previous: res.meta?.previous ?? null, next: res.meta?.next ?? null } : null;
}

export async function getServices(): Promise<Service[]> {
  return (await getJson<Service[]>('/services', ['services']))?.data ?? [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return (await getJson<Testimonial[]>('/testimonials', ['testimonials']))?.data ?? [];
}

export async function getSkills(): Promise<Skill[]> {
  return (await getJson<Skill[]>('/skills', ['skills']))?.data ?? [];
}

export async function getExperience(): Promise<Experience[]> {
  return (await getJson<Experience[]>('/experience', ['experience']))?.data ?? [];
}
