# Rimantė Mizaraitė — website

Astro + Keystatic + Cloudflare. Static public pages, live CMS at `/keystatic`.

## Quick start

```bash
npm install
npm run dev
```

- Site: http://localhost:4321
- CMS:  http://localhost:4321/keystatic

Runs in **local mode** by default — edits write straight to files in
`src/content/`. Commit them like any other change.

## Switching to Keystatic Cloud

Cloud mode lets the client edit the live site without a GitHub account.

1. Push this repo to GitHub.
2. Create a team + project at [keystatic.cloud](https://keystatic.cloud),
   connected to that repo.
   **Create a separate team per client.** Access is granted at team level and
   every user in a team can see every project in it. Free plan = 3 users per
   team, unlimited teams.
3. Set the project slug in `keystatic.config.ts`:
   ```ts
   const CLOUD_PROJECT = 'your-team/rimante-mizaraite'
   ```
4. Add `.env`:
   ```
   PUBLIC_KEYSTATIC_STORAGE=cloud
   ```

Client edits then commit to GitHub, which triggers a Cloudflare rebuild.

## Deploying to Cloudflare

```bash
npm run build
npx wrangler deploy
```

`wrangler.jsonc` already sets the two required compatibility flags:

- `nodejs_compat` — required by the Astro Cloudflare adapter
- `disable_nodejs_process_v2` — works around a known bug where `nodejs_compat`
  makes non-prerendered routes return `[object Object]`

Cloudflare's free tier permits commercial use and unlimited bandwidth.
(Vercel's Hobby tier does **not** — it forbids client work.)

## Project structure

```
src/
  content/          content edited via Keystatic
    settings/       site-wide settings (JSON)
    pages/          page content (JSON + Markdoc)
    services/       session types and prices
    faq/            FAQ entries
  content.config.ts Astro collections — how content is read
  lib/content.ts    content helpers
  layouts/Base.astro  shell, SEO, JSON-LD
  components/       header, footer, buttons, sections
  pages/            routes (Lithuanian slugs)
  styles/global.css design tokens
keystatic.config.ts CMS schema (Lithuanian labels)
```

## Pages

| Route | Page |
|---|---|
| `/` | Pradžia |
| `/apie` | Apie mane |
| `/kaip-vyksta` | Kaip vyksta konsultacijos |
| `/kainos` | Kainos |
| `/duk` | D.U.K. |
| `/registracija` | Registracija |
| `/kontaktai` | Kontaktai |
| `/privatumo-politika` | Privatumo politika |

## Before launch

- [ ] Legal review of advertising-law compliance (see `CLAUDE.md`)
- [ ] Real photography — therapist portrait + empty room only
- [ ] Real Lithuanian copy replacing all placeholder text
- [ ] Cal.com booking URL in site settings, tested end to end incl. cancellation
- [ ] Contact form wired to a real endpoint with no third-party retention
- [ ] Cookieless analytics
- [ ] Privacy policy reviewed by a lawyer
- [ ] `site:` in `astro.config.mjs` and the sitemap URL in `public/robots.txt`
      changed from `example.lt`
- [ ] Google Business Profile + directory listings created
