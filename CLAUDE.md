# CLAUDE.md

Project guidance for AI assistants working in this repo.

## What this is

Website for an individual psychotherapist in private practice in Vilnius,
Lithuania. Solo practitioner. All user-facing content is **Lithuanian**.

## ⚠️ Legal constraints — read before adding ANY content or imagery

Lithuanian law (Reklamos įstatymas, Art. 15) heavily restricts advertising of
healthcare services. Violations have drawn fines of €20,000+ upheld by the
Supreme Administrative Court.

**Never add, and remove on sight:**

- Testimonials, client quotes, reviews, star ratings, or any republished
  patient feedback. Patient consent does **not** make these legal.
- Any image that creates the impression of a patient — including models,
  actors, stock photography, staged scenes, and AI-generated people.
  A photo of two people talking, someone on a sofa, or a hand on a shoulder
  all violate this.
- Endorsements or recommendations from healthcare professionals,
  institutions, or professional bodies.

**Permitted imagery, exhaustively:** portraits of the therapist alone,
photographs of the empty consulting room, the building entrance, and quiet
detail shots with no people in them.

**Permitted claims:** the nature of the services, organisational details,
pricing, premises, methods, and references to scientific research.

Every template asset for therapist websites includes a testimonials section.
This one must not. If asked to add "social proof", push back and explain why.

## Stack

- **Astro 7** — static output, Cloudflare adapter
- **Keystatic** — content editing at `/keystatic`
- **Tailwind 4** — CSS-first config via `@theme` in `src/styles/global.css`
- **Cloudflare Pages/Workers** — hosting

## Architecture — two things that will bite you

**1. Do NOT use the Keystatic Reader API in pages.**
Under the Cloudflare adapter, prerendering runs in a worker-like environment
where `node:fs` is a shim with no real disk and `process.cwd()` is `/`. The
Reader silently returns `null` for everything — no error, just empty pages.
Content is read through **Astro content collections** (`src/content.config.ts`)
and direct JSON imports instead. Keep it that way.

**2. Public pages are prerendered; only `/keystatic` is server-rendered.**
`output: 'static'` plus the adapter gives us fast static pages with a live
admin UI. Don't switch to `output: 'server'`.

## Content model

| Where | What |
|---|---|
| `src/content/settings/site.json` | Contacts, hours, address, booking URL |
| `src/content/pages/*.json` | Home, booking, contact (structured pages) |
| `src/content/pages/*.mdoc` | About, approach, privacy (long-form) |
| `src/content/services/*.mdoc` | Session types, durations, prices |
| `src/content/faq/*.mdoc` | FAQ entries |

Keystatic field labels are in Lithuanian — the client uses this UI. Keep new
labels Lithuanian too, with `description` help text where the field isn't
self-evident.

## Design rules

- **Light mode only.** No dark theme, no dark sections.
- Warm neutrals (sand / clay / ink tokens). Never clinical blue-and-white.
- Serif headings (Lora), sans body (Inter). Both loaded with
  `subset=latin-ext` — **required** for ą č ę ė į š ų ū ž.
- Body ≥18px, line-height 1.6–1.7, measure ≤68ch (`.prose-measure`).
- Minimal JavaScript. Menu and FAQ use native `<details>`. No React on public
  pages — React exists only for the Keystatic admin UI.
- Primary CTA everywhere: the free 15-minute intro call. The contact form is
  always visually secondary.

## GDPR

- The contact form collects name, email, message only. **No health data.**
  Keep the field label soft and the helper note discouraging detail.
- Form must post to email with **no third-party retention** of submissions.
- Analytics must be cookieless (Plausible / Umami) so no consent banner.
- Privacy policy is CMS-editable and must match actual practice.

## Copy

Never invent Lithuanian copy and present it as final. Existing content is
clearly marked placeholder ("Pastaba: pavyzdinis tekstas"). Keep that marker
until the therapist supplies real text.
