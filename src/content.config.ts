import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

/**
 * Astro reads the Markdoc files Keystatic writes.
 *
 * NOTE: we deliberately do NOT use Keystatic's Reader API here. Under the
 * Cloudflare adapter, prerendering runs in a worker-like environment where
 * node:fs is a shim with no real disk access, so the Reader silently returns
 * null for everything. Astro's content layer runs in the real Node build
 * pipeline and works correctly.
 */

const services = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
    duration: z.string().optional(),
    price: z.string().optional(),
    format: z.array(z.string()).default([]),
    forNewClients: z.boolean().default(false),
  }),
})

const faq = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    order: z.number().default(0),
  }),
})

const seo = z
  .object({ title: z.string().optional(), description: z.string().optional() })
  .optional()

const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/pages' }),
  schema: z.object({
    seo,
    heading: z.string().optional(),
    intro: z.string().optional(),
    portrait: z.string().optional(),
    portraitAlt: z.string().optional(),
    lastUpdated: z.string().optional(),
    firstSessionHeading: z.string().optional(),
    firstSessionText: z.string().optional(),
    qualifications: z
      .array(
        z.object({
          title: z.string(),
          institution: z.string().optional(),
          year: z.string().optional(),
        })
      )
      .default([]),
  }),
})

export const collections = { services, faq, pages }
