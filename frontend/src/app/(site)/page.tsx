import { About } from '@/components/sections/about/About';
import { Contact } from '@/components/sections/contact/Contact';
import { Expertise } from '@/components/sections/expertise/Expertise';
import { GrowthAtlas } from '@/components/sections/gallery/GrowthAtlas';
import { Hero } from '@/components/sections/hero/Hero';
import { Journey } from '@/components/sections/journey/Journey';
import { Testimonials } from '@/components/sections/testimonials/Testimonials';
import { SelectedWork } from '@/components/sections/work/SelectedWork';
import { getExperience, getGallery, getProjects, getServices, getSettings, getSkills, getTestimonials } from '@/lib/api/server';

export default async function HomePage() {
  const [settings, projects, services, skills, experience, testimonials, gallery] = await Promise.all([
    getSettings(),
    getProjects(),
    getServices(),
    getSkills(),
    getExperience(),
    getTestimonials(),
    getGallery(),
  ]);

  const featured = projects.filter((project) => project.featured);
  const selected = (featured.length > 0 ? featured : projects).slice(0, 4);

  // Section numbers follow the order actually shown (empty sections are skipped).
  const order = ['about', gallery.length > 0 && 'gallery', selected.length > 0 && 'work', services.length > 0 && 'expertise', experience.length > 0 && 'journey', testimonials.length > 0 && 'testimonials', 'contact'].filter(
    Boolean,
  ) as string[];
  const num = (key: string) => String(order.indexOf(key) + 1).padStart(2, '0');

  return (
    <>
      <Hero settings={settings} />
      <About settings={settings} experience={experience} skills={skills} index={num('about')} />
      <GrowthAtlas items={gallery} index={num('gallery')} />
      <SelectedWork projects={selected} total={projects.length} index={num('work')} />
      <Expertise services={services} index={num('expertise')} />
      <Journey experience={experience} index={num('journey')} />
      <Testimonials testimonials={testimonials} index={num('testimonials')} />
      <Contact settings={settings} index={num('contact')} />
    </>
  );
}
