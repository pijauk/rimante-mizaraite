# Setup: GitHub → Keystatic Cloud → Cloudflare

Do these in order. Steps 1–2 are one-time; step 5 is what makes the whole thing
work end to end.

---

## 1. Get the code onto GitHub

### 1a. Check git is set up

```bash
git --version
git config --global user.name    # if blank, set it
git config --global user.email
```

If either is blank:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### 1b. Make the first commit

```bash
cd "/Users/pj/Documents/Websites/Rimante Mizaraite"
git init
git add .
git status          # ← READ THIS before committing
```

**Check `git status` shows no `node_modules/`, no `dist/`, no `.env`.** If it
does, stop — `.gitignore` isn't being picked up.

```bash
git commit -m "Initial site: Astro + Keystatic + Cloudflare"
```

### 1c. Create the GitHub repo

**Make it private.** This is client work, and Keystatic Cloud handles private
repos fine.

**Option A — GitHub CLI (easiest):**

```bash
gh --version    # if missing: brew install gh
gh auth login   # follow the browser prompts
gh repo create rimante-mizaraite --private --source=. --remote=origin --push
```

That creates the repo and pushes in one go. Skip to step 2.

**Option B — web:**

1. Go to [github.com/new](https://github.com/new)
2. Name: `rimante-mizaraite`
3. Select **Private**
4. Do **not** tick "Add a README" / .gitignore / licence — the repo must be
   empty or the push will conflict
5. Create, then run what GitHub shows you, which is:

```bash
git remote add origin https://github.com/YOUR-USERNAME/rimante-mizaraite.git
git branch -M main
git push -u origin main
```

---

## 2. Keystatic Cloud

1. Sign in at [keystatic.cloud](https://keystatic.cloud) (GitHub sign-in).

2. **Create a team.** Name it after the client, e.g. `rimante`.

   > ⚠️ **One team per client, always.** Access is granted at *team* level and
   > every user in a team can see every project in that team. Put two clients
   > in one team and each can browse the other's site content.

3. **Create a project** inside that team, connected to the
   `rimante-mizaraite` GitHub repo. Keystatic will ask to install its GitHub
   App — approve it for that repo only.

4. Copy the project slug it shows you. It looks like `rimante/rimante-mizaraite`
   (`team/project`).

### 2a. Put the slug in the config

Edit `keystatic.config.ts`, line ~19:

```ts
const CLOUD_PROJECT = 'rimante/rimante-mizaraite'   // ← your actual slug
```

### 2b. Turn on cloud mode locally

```bash
cp .env.example .env
```

`.env` should contain:

```
PUBLIC_KEYSTATIC_STORAGE=cloud
```

The `PUBLIC_` prefix is required — the admin UI runs in the browser, and Astro
only exposes `PUBLIC_`-prefixed vars to client code. Without it Keystatic
silently falls back to local mode.

### 2c. Test it

```bash
npm run dev
```

Open http://localhost:4321/keystatic — you should be asked to sign in via
Keystatic Cloud, then see the content. Make a small edit and save: it should
appear as a **commit in the GitHub repo**. If it does, cloud mode works.

```bash
git add -A && git commit -m "Enable Keystatic Cloud" && git push
```

---

## 3. Invite the therapist

In Keystatic Cloud → your team → **Members** → invite her email.

She does **not** need a GitHub account — Keystatic Cloud handles auth. Free plan
covers 3 users per team, so you + her leaves one spare.

---

## 4. Connect Cloudflare to Git

This is the step that makes her edits actually reach the live site.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Connect to Git**
2. Authorise GitHub, pick `rimante-mizaraite`
3. Build settings:

   | Field | Value |
   |---|---|
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Output directory | `dist` |
   | Node version | `22` (add env var `NODE_VERSION=22` if it defaults lower) |

4. **Environment variables** — add for both Production and Preview:

   ```
   PUBLIC_KEYSTATIC_STORAGE = cloud
   ```

   Miss this and the deployed `/keystatic` reverts to local mode and breaks.

5. Save and deploy.

---

## 5. Verify the full loop

This is the only test that matters:

1. Therapist opens `https://your-site/keystatic` and changes a price
2. Keystatic Cloud commits that to GitHub
3. Cloudflare sees the commit and rebuilds
4. The new price is live in ~1 minute

If step 3 doesn't fire, the git connection in step 4 isn't set up correctly —
her edits will sit in the repo and never appear on the site.

---

## 6. Before real launch

- [ ] Custom domain (Cloudflare → your worker → Domains & Routes)
- [ ] `site:` in `astro.config.mjs` — currently `https://example.lt`
- [ ] `Sitemap:` line in `public/robots.txt` — same
- [ ] Real photos and copy
- [ ] Legal review of advertising-law compliance (see `CLAUDE.md`)
