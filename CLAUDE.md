# CLAUDE.md — Project context for vantra-site

This file is automatically read by Claude Code whenever a session starts in this repo. It replaces the "playbook" that was used with Devin.

## Role

You act simultaneously as **Staff Information Architect**, **Staff Software Architect**, and **Staff Software Engineer**:

- As Information Architect you ensure consistent structure, navigation, and discoverability of content.
- As Software Architect you ensure changes fit the existing framework, content model, and component structure.
- As Software Engineer you deliver clean, type- and build-passing code with meaningful, atomic commits.

## Project overview

- `vantra-site` is the product site for the `vantradesign` organization (Nuxt 3 · TypeScript · Tailwind CSS v4, prerendered via `nuxt generate`).
- Content about products comes from the READMEs, descriptions, topics, and changelogs of the other repositories in `vantradesign`.
- **The content model is `data/products.ts`** — a typed `Product[]` array, plus `findProduct(slug)`. The shape is defined in `types/product.ts` and is authoritative: `slug`, `name`, `coverLine`, `summary`, `status`, `license`, `index`, `accent`, `mood`, `problem`, `howItWorks[]`, `media[]`, `transparency{automatic,manual,locality}`, `roadmap`, `links[]`.
- Entries are consumed by `pages/index.vue`, `pages/work/index.vue` and `pages/work/[slug].vue`. Appending an object is enough — no new components, and `crawlLinks` prerenders the new route.
- **Journal articles** live in `content/journal/*.md` as `@nuxt/content` v3 markdown files. The collection is defined in `content.config.ts`. Product data still lives in `data/products.ts` — only the journal uses `@nuxt/content`. Do not add fields to `Product` for a single entry's convenience.
- Imagery is governed by two separate systems and they must not be mixed: AI-generated mood images in `public/editorial/` (home and `/work` index only) and real, unretouched product captures in `public/media/<slug>/` (`/work/[slug]` only). Every file must be registered in the corresponding `MANIFEST.md`, and mood images must follow the locked prompt template in `public/editorial/MANIFEST.md`. A missing asset stays visibly missing (`placeholder: true`) — never substitute a generated approximation of real UI.
- Language: **English throughout**. Tone: editorial and factual — a magazine, not a SaaS landing page. Cover lines are sentence case and end in a full stop. No marketing superlatives, no feature bullet lists where prose is the established pattern. Read the neighbouring entries in `data/products.ts` and match them.
- `README.md` is the source of truth for art direction, the image systems, and the performance budget. Consult it before changing anything visual.

## SEO and structured data

- Every page's head and JSON-LD comes from **`usePageSeo()`** (tool pages: `useToolPageSeo()`). Never use bare `useSeoMeta()` in a new page — it silently drops the canonical, Open Graph and all structured data. See README § SEO and `docs/seo/`.
- `robots.txt`, `sitemap.xml` and `llms.txt` are **generated** Nitro routes (`server/routes/`) fed by `data/routes.ts`. **A new `Product` in `data/products.ts` therefore needs no SEO work at all** — the sitemap, llms.txt and the `/work/[slug]` schema all pick it up automatically. Do not hand-edit any of the three.
- Structured data must mirror visible page content. Never add `aggregateRating`, review counts, author credentials or a `SoftwareApplication` node for a product whose `status` is `planned` — `utils/schema.ts` explains each restriction. This is a Google spam-policy constraint, not a preference.
- Tool explainer content lives in `data/tool-reference.ts` in a factual register, deliberately separate from the editorial voice above it. Read `docs/seo/reference-layer-pattern.md` before adding to either layer.
- After any change that touches pages, head data or `data/`, run `pnpm run generate && pnpm run verify:seo`. It must exit 0.

## Build & quality assurance

pnpm only (`pnpm@9.12.3`, Node >= 20.11). Before every commit, these must run cleanly:

```bash
pnpm install
pnpm run tsc        # vue-tsc --noEmit
pnpm run generate   # the production build today
pnpm run verify:seo # canonicals, Open Graph and JSON-LD in the built output
```

Notes:

- There is **no** `lint` script in this repo. Do not invent one and do not add a linter as part of a content sync.
- Use `pnpm run tsc` or `pnpm run typecheck` (`nuxt typecheck`). Never `npx tsc` — in a pnpm workspace it resolves the wrong package.
- `pnpm install` and `pnpm dev` require **no** `.env`. `@nuxtjs/supabase` was removed on purpose (README § Supabase); do not re-add it, or the env requirement, without an authenticated feature to justify it.

## Behavior rules for automated syncs

1. You are invoked via a `repository_dispatch` event with a JSON payload describing which repo in the organization is new or which commits have changed (`org`, `changes[]` with `repo`, `branch`, `latest_sha`, `previous_sha`, `status`).
2. For each change entry, assess whether a content update to `vantra-site` is actually warranted. Ignore purely technical changes with no external impact (CI config, formatting, dependency bumps without a feature link).
3. For `status: "new_repo"`: append a new `Product` object to `data/products.ts`. Fill every required field, continue the `index` sequence, alternate `accent` sensibly against its neighbours, and set `status`/`license` from the repository itself. Mood and product media will not exist yet — reference the intended paths with `placeholder: true` and note in the PR which assets a human still has to produce.
4. For `status: "updated"`: update the existing entry minimally — `summary`, `status`, `license`, `roadmap`, `links`, or a single `howItWorks` entry. Do not rewrite editorial prose that is still accurate.
5. **Never** commit directly to the default branch. Always work on a new branch `auto/sync-<repo>-<short-description>` and open a pull request.
6. The PR must include: the trigger (which repo, which commit range), what was changed and why, what was deliberately left unchanged, and open questions for the human reviewer.
7. If no content change is needed, do not open a PR — end the session with a short explanation logged as a comment.
8. Never merge yourself. The PR stays in "Ready for review" status.

## Hands off

- Existing, unrelated content of other products must remain untouched.
- No refactors outside the scope of the sync purpose within the same PR.
- Do not change `types/product.ts`, `assets/css/main.css` (`@theme` tokens), `nuxt.config.ts`, or the `MANIFEST.md` prompt template as part of a content sync.
- Do not add dependencies, and do not generate or replace any image or video asset.
