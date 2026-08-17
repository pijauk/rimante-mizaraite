# Deploying to Cloudflare

## Step 1 — Log in (you must do this yourself)

```bash
npx wrangler login
```

Opens a browser for Cloudflare OAuth. If you don't have an account yet, create
one first at [dash.cloudflare.com](https://dash.cloudflare.com) — free tier is
enough, and unlike Vercel's Hobby plan it **permits commercial use**.

## Step 2 — Deploy

```bash
npm run deploy
```

That runs `astro build && wrangler deploy`. First deploy will ask to register a
`workers.dev` subdomain. The site lands at:

```
https://rimante-mizaraite.<your-subdomain>.workers.dev
```

## Step 3 — Check it worked

- `/` `/apie` `/kainos` `/duk` — should render, fast, no JS
- View source: `<title>` and the `LocalBusiness` JSON-LD should be populated
- Any page returning literally `[object Object]` means the compatibility flags
  in `wrangler.jsonc` got lost — both `nodejs_compat` and
  `disable_nodejs_process_v2` are required

---

## ⚠️ `/keystatic` will NOT work on the deployed site yet

The project ships in **local storage mode**, which reads and writes files on
your disk. There is no disk in production, so the deployed `/keystatic` is
non-functional until you switch to Cloud mode.

This is expected for a first test deploy. The public pages work fine because
they're prerendered at build time.

### Switching to Cloud mode (needed before the client touches it)

1. Push this repo to GitHub.

2. Create a team + project at [keystatic.cloud](https://keystatic.cloud),
   pointed at that repo.

   > **One team per client.** Access is granted at team level and every user in
   > a team sees every project in it. Free plan: 3 users per team, unlimited
   > teams and projects.

3. Set the slug in `keystatic.config.ts`:
   ```ts
   const CLOUD_PROJECT = 'your-team/rimante-mizaraite'
   ```

4. Set the env var — locally in `.env`, and in the Cloudflare dashboard under
   **Workers → Settings → Variables**:
   ```
   PUBLIC_KEYSTATIC_STORAGE=cloud
   ```

5. Redeploy.

---

## Step 4 — Git-connected builds (do this before handover)

`wrangler deploy` from your laptop is fine for testing, but the real workflow
needs automatic rebuilds, because **the client's edits are git commits**:

```
client edits /keystatic → Keystatic Cloud commits to GitHub → Cloudflare rebuilds
```

Without this, their changes sit in the repo and never reach the live site.

Set it up in the Cloudflare dashboard: **Workers & Pages → Create → Connect to
Git**, select the repo, build command `npm run build`, output directory `dist`.

## Step 5 — Custom domain

**Workers & Pages → your worker → Settings → Domains & Routes → Add custom
domain.** Cloudflare issues the certificate automatically.

Then update, in this order:

- `site:` in `astro.config.mjs` (currently `https://example.lt`)
- the `Sitemap:` line in `public/robots.txt`

Both currently point at `example.lt`, so canonical URLs and the sitemap will be
wrong until you change them.

## Costs

| | |
|---|---|
| Cloudflare Workers free tier | €0 — 100k requests/day, unlimited bandwidth, commercial use allowed |
| Keystatic Cloud free tier | €0 — 3 users per team |
| Domain | ~€12/year |
| Cal.com | €0 on the free tier |
