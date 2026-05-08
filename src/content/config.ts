import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    order:       z.number().default(0),
    heroHeading: z.string().optional(),
    faqs:        z.array(z.object({
      q: z.string(),
      a: z.string(),
    })).optional(),
  }),
});

const areas = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    city:        z.string(),
    state:       z.string(),
    zip:         z.string().optional(),
  }),
});

export const collections = { services, areas };
