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
// The Cloudflare adapter runs `astro dev` through workerd. That constantly
// fights Vite's SSR dependency optimizer ("The file does not exist at
// node_modules/.vite/deps_ssr/rolldown-runtime-*.js"). We only need the
// adapter to BUILD, so apply it for builds only — dev then uses plain Node
// and is faster and stable.
//
// Trade-off: dev no longer runs the production runtime. Before deploying,
// check the real thing with `npm run preview:cf` (astro build && wrangler dev).
const isBuild = process.argv.includes('build')

/**
 * Dev-only API behind the colour editor at /dev/spalvos.
 *
 * Deliberately a Vite dev-server middleware rather than an Astro route:
 * `configureServer` only runs under `astro dev`, so an endpoint that writes to
 * source files cannot be deployed. It also keeps /keystatic the only
 * server-rendered route in the build.
 *
 *   GET  /__theme  -> the colour tokens currently in global.css
 *   POST /__theme  -> { "--color-clay-500": "#967251", ... } written to the file
 */
function themeEditorApi() {
  return {
    name: 'theme-editor-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__theme', async (req, res) => {
        const json = (status, body) => {
          res.statusCode = status
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(body))
        }
        try {
          const { readTokens, writeTokens } = await import('./tools/theme-tokens.mjs')

          if (req.method === 'GET') return json(200, { tokens: await readTokens() })

          if (req.method === 'POST') {
            const chunks = []
            for await (const c of req) chunks.push(c)
            const updates = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
            const result = await writeTokens(updates)
            return json(200, { ok: true, ...result })
          }

          return json(405, { error: 'Use GET or POST' })
        } catch (err) {
          return json(500, { error: err instanceof Error ? err.message : String(err) })
        }
      })
    },
  }
}

export default defineConfig({
  site: 'https://example.lt',
  output: 'static',
  // We use no sessions. Without this the Cloudflare adapter auto-enables a
  // KV-backed session store and deploys fail until you create a KV namespace.
  session: false,
  adapter: isBuild ? cloudflare({ imageService: 'compile' }) : undefined,
  integrations: [
    react(),
    markdoc(),
    keystatic(),
    // /dev/* is tooling, never public
    sitemap({ filter: (page) => !page.includes('/dev/') }),
  ],
  vite: {
    plugins: [tailwindcss(), themeEditorApi()],
    // process.cwd() is "/" inside the Cloudflare prerender environment, so the
    // Keystatic reader cannot find src/content. Bake in the real project root
    // here, where cwd is still correct.
    define: { __PROJECT_ROOT__: JSON.stringify(process.cwd()) },
    resolve: {
      alias: [{ find: /^@keystatic\/core\/reader$/, replacement: keystaticReaderNode }],
    },
  },
})
