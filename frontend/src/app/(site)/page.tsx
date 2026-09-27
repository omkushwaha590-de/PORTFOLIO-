import { About } from '@/components/sections/about/About';
import { Approach } from '@/components/sections/approach/Approach';
import { Contact } from '@/components/sections/contact/Contact';
import { Expertise } from '@/components/sections/expertise/Expertise';
import { Hero } from '@/components/sections/hero/Hero';
import { Journey } from '@/components/sections/journey/Journey';
import { Testimonials } from '@/components/sections/testimonials/Testimonials';
import { Toolkit } from '@/components/sections/toolkit/Toolkit';
import { SelectedWork } from '@/components/sections/work/SelectedWork';
import { getExperience, getProjects, getServices, getSettings, getSkills, getTestimonials } from '@/lib/api/server';

export default async function HomePage() {
  const [settings, projects, services, skills, experience, testimonials] = await Promise.all([
    getSettings(),
    getProjects(),
    getServices(),
    getSkills(),
    getExperience(),
    getTestimonials(),
  ]);

  const featured = projects.filter((project) => project.featured);
  const selected = (featured.length > 0 ? featured : projects).slice(0, 4);

  return (
    <>
      <Hero settings={settings} services={services} />
      <About settings={settings} experience={experience} skills={skills} />
      <Expertise services={services} />
      <SelectedWork projects={selected} total={projects.length} />
      <Approach />
      <Toolkit skills={skills} />
      <Journey experience={experience} />
      <Testimonials testimonials={testimonials} />
      <Contact settings={settings} />
    </>
  );
}
