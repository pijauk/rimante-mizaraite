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
    duration: z.string().nullable().optional(),
    price: z.string().nullable().optional(),
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

// Keystatic writes `null` for empty optional fields, so every optional string
// must be .nullable() as well as .optional() — otherwise the build fails with
// InvalidContentEntryDataError the first time the client clears a field.
const seo = z
  .object({
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })
  .nullable()
  .optional()

const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/pages' }),
  schema: z.object({
    seo,
    heading: z.string().nullable().optional(),
    intro: z.string().nullable().optional(),
    portrait: z.string().nullable().optional(),
    portraitAlt: z.string().nullable().optional(),
    lastUpdated: z.string().nullable().optional(),
    firstSessionHeading: z.string().nullable().optional(),
    firstSessionText: z.string().nullable().optional(),
    qualifications: z
      .array(
        z.object({
          title: z.string(),
          institution: z.string().nullable().optional(),
          year: z.string().nullable().optional(),
        })
      )
      .default([]),
  }),
})

export const collections = { services, faq, pages }
