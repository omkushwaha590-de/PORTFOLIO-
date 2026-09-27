import { Experience } from '../models/experience.model';
import { Service } from '../models/service.model';
import { Skill } from '../models/skill.model';
import { Testimonial } from '../models/testimonial.model';
import { createContentCrud } from './content-crud.factory';

export const servicesController = createContentCrud({ model: Service, label: 'Service', slugFrom: 'title' });

export const testimonialsController = createContentCrud({ model: Testimonial, label: 'Testimonial' });

export const skillsController = createContentCrud({ model: Skill, label: 'Skill' });

export const experienceController = createContentCrud({ model: Experience, label: 'Experience entry' });
