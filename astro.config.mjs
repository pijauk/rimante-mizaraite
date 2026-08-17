// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import markdoc from '@astrojs/markdoc'
import sitemap from '@astrojs/sitemap'
import keystatic from '@keystatic/astro'
import cloudflare from '@astrojs/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// The Cloudflare adapter sets vite's "worker" export condition, which makes
// @keystatic/core/reader resolve to a build with no real filesystem — so all
// content reads come back empty. Every content page here is prerendered, so
// the reader only ever runs at build time in Node. Pin it to the Node build.
const keystaticReaderNode = fileURLToPath(
  new URL(
    './node_modules/@keystatic/core/dist/keystatic-core-reader.node.js',
    import.meta.url
  )
)

// Public pages are prerendered (fast + SEO). Only the /keystatic admin
// routes run on the server — see src/pages/keystatic/[...params].astro
export default defineConfig({
  site: 'https://example.lt',
  output: 'static',
  // We use no sessions. Without this the Cloudflare adapter auto-enables a
  // KV-backed session store and deploys fail until you create a KV namespace.
  session: false,
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [react(), markdoc(), keystatic(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    // process.cwd() is "/" inside the Cloudflare prerender environment, so the
    // Keystatic reader cannot find src/content. Bake in the real project root
    // here, where cwd is still correct.
    define: { __PROJECT_ROOT__: JSON.stringify(process.cwd()) },
    resolve: {
      alias: [{ find: /^@keystatic\/core\/reader$/, replacement: keystaticReaderNode }],
    },
  },
})
