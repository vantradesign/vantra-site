# SEO + GEO engagement — summary report

**Date:** 2026-08-13
**Repository:** `vantra-site` (Nuxt 3 · Vue 3 · Cloudflare Pages — stack unchanged)
**Verification:** `pnpm run tsc` ✅ · `pnpm test` 131/131 ✅ · `pnpm run generate` ✅ · `pnpm run verify:seo` 23 pages, 0 failures ✅

| Document | Contents |
| --- | --- |
| [`audit-2026-08.md`](./audit-2026-08.md) | Phase 1. All 19 issues, severity, fix status, judgment calls |
| [`reference-layer-pattern.md`](./reference-layer-pattern.md) | Phase 2. Before/after per page, and the reusable pattern |
| [`offsite-backlog.md`](./offsite-backlog.md) | Phase 4. Prioritised off-site backlog. **Advisory, no code** |
| [`monitoring-runbook.md`](./monitoring-runbook.md) | Phase 5. What to check, how often, where to log it |

---

## What was fixed

**The starting position was lopsided.** Everything expensive was already right:
`ssr: true` with full prerendering, so all content ships in the initial HTML;
self-hosted fonts with metric-matched fallbacks; zero third-party scripts; no
content behind JS, a login, or an accordion. There was nothing to repair in the
rendering or performance foundation.

Everything cheap was missing. No `robots.txt`, no sitemap, **no canonical tag on
any of the 20 routes**, no Open Graph, and no structured data anywhere. The site
was crawlable by accident rather than by instruction.

### Phase 1 — Technical & crawler

- `robots.txt`, `sitemap.xml`, `llms.txt` as **generated** Nitro routes fed by
  `data/routes.ts`, so a new tool or product appears in all three automatically.
- AI crawlers explicitly allowed — a deliberate position, with the reasoning
  recorded in the file. Notably `Google-Extended` is not blocked, since it is an
  AI-Overviews grounding opt-out rather than a crawl control.
- `/journal` set to `noindex, follow` and removed from the sitemap: its only
  content was a promise of future content, and thin content is assessed site-wide.
- Confirmed inline JSON-LD survives the strict `script-src 'self'` CSP — the build
  still reports exactly **1** inline script hash after adding JSON-LD to 23 pages.

### Phase 2 — On-page (SEO + GEO)

The brief's Phase 2 collided with a documented convention: `README.md` and
`CLAUDE.md` mandate magazine voice, no bullet lists, cover lines under 22
characters. Rather than override that silently, the fix adds a **second register**
below each tool instead of rewriting the first.

Eleven tool pages gained an answer block (self-contained, under ~45 words),
question-led `<h3>`s, comparison tables where the page had none, a 3–5 item FAQ,
and 2–3 cited primary sources — MDN, W3C specs, WCAG understanding documents.
`/tools/clamp-calculator` previously did not contain the word "formula"; it now
states the derivation, with worked values at three viewports.

Every claim was checked against the implementation in `utils/tools/` — which
caught two of my own errors before they shipped: a miscomputed rem intercept
(0.9429 → 0.9643) and a wrong Safari subgrid ship year.

### Phase 3 — Structured data

`utils/schema.ts` emits one `@graph` per page with stable `@id`s, so cross-page
references resolve rather than creating duplicate entities. `Organization`,
`WebSite`, `WebPage`/`CollectionPage`/`AboutPage`/`ContactPage`, `BreadcrumbList`,
`WebApplication`, `SoftwareApplication`, `Person`, `ItemList`, `FAQPage`.

Three restraints, all recorded in code comments: no `aggregateRating` (nobody has
rated these tools), no invented credentials on the `Person` node, and no
`SoftwareApplication` for a product whose `status` is `planned` — a planned entry
is an announcement, and marking it as an application would contradict the visible
page.

`FAQPage` markup is generated from the same array the template renders, so visible
and structured answers cannot drift.

### Phases 4 & 5 — Advisory

Delivered as markdown, cleanly separated from the engineering work.

### Also added

`scripts/verify-seo.mjs` (`pnpm run verify:seo`) — validates the emitted HTML:
canonical correctness and agreement with `og:url`, JSON-LD parse validity and
required fields per type, breadcrumb position sequencing, FAQ answer presence,
sitemap/`noindex` consistency, and unexpected `noindex`. Exits non-zero, so it can
gate a deploy. Conventions recorded in `README.md` and `CLAUDE.md` so the automated
sync workflow cannot undo them.

---

## What is still outstanding

| Item | Severity | Owner / next step |
| --- | --- | --- |
| **Submit sitemap to Google Search Console + Bing Webmaster Tools** | **Blocking everything** | You. ~15 minutes. No measurement in the runbook produces data until this is done. Bing matters disproportionately — it is the index behind ChatGPT search. |
| **OG-1: no Open Graph image** | High for social, **zero** for ranking or AI citation | You. Needs a 1200×630 asset following the locked prompt template in `public/editorial/MANIFEST.md`; I cannot generate images. Once it exists, adding `ogImage` and switching `twitterCard` to `summary_large_image` is a two-line change in `usePageSeo()`. |
| **CWV-1: Core Web Vitals unmeasured on production** | Medium | You, after deployment. The build's characteristics are excellent by construction, but you asked for real measurement, not assumption. Test `/`, `/tools/layout-builder` (watch **INP** — the only page with substantial drag) and `/work/accessibility-auto-fixer` (**LCP**/**CLS** — most media). |
| **All of `offsite-backlog.md`** | **Highest of anything here** | You. Cannot be done from inside this repo. |
| DESC-2: one 167-char meta description | Low | Left deliberately — it comes from `product.summary`, and `CLAUDE.md` forbids adding a `Product` field for one entry's convenience. Seven characters of truncation is not worth either alternative. |
| Reference layer for future tools | Low | The pattern is documented and the component no-ops for a slug with no entry, so tool 12 can ship before its reference content. |

---

## Top 5 highest-leverage next actions

Ranked by expected impact on **both** classic ranking and AI-citation visibility.

### 1. Submit the sitemap to GSC and Bing — 15 minutes

Nothing else on this list matters until engines know the site exists. Highest
impact-to-effort ratio by a wide margin, and it is the only item that is pure
overhead with no judgment required.

### 2. Work Priority 1 of the off-site backlog — a few hours

Repo descriptions, topics, READMEs linking to hosted tool pages, and the org
profile README. GitHub is in every major model's training corpus and is crawled
constantly. This is the only category of off-site authority that is entirely under
your control, requires no one's permission, and needs no community standing — and
it directly feeds the corpus that answer engines draw on.

### 3. Answer real questions on Reddit and Stack Overflow — ongoing

This is where AI citations actually come from. Reddit is among the most frequently
cited domains in AI Overviews, and the large majority of AI brand mentions
originate off-site rather than from a brand's own domain. The reference content in
`data/tool-reference.ts` is already written at the right level to adapt into
genuine answers.

**The discipline matters more than the volume:** answer the question first, link
only when the link is the best available answer. Drive-by promotion gets removed
and taints the domain in the exact community that would otherwise recommend it.

### 4. Publish one technical article per priority topic — 2–3 days each

The clamp formula derivation, why vw-only fluid type fails WCAG 1.4.4, grid-vs-flex
decision criteria. dev.to or Hashnode first (they rank fast and are
well-represented in training data), canonicalised back to the tool page so it keeps
the authority. Then pitch CSS-Tricks or Smashing — longer lead time, highest single
authority payoff available.

### 5. Produce the OG image, then start the weekly monitoring loop — 1 hour, then 15 min/week

The image unblocks Show HN and Product Hunt, both of which want a share card. The
loop is what turns everything above from activity into measurement.

**Log the zeros.** Expect 0% AI citation share for the first few months — that is
the off-site timeline, not a failure of the on-site work. Recording the absence is
what makes the first citation legible as progress.

---

## Honest assessment

The on-site work is complete and done to a standard I would defend in review:
correct, verified against the real build output, documented, guarded by an
automated check, and free of any tactic that risks a penalty. It removes every
technical reason Vantra could fail to rank or fail to be cited.

It will not, on its own, win `clamp font generator`. That query is held by tools
with years of accumulated links and community mentions, and they do not hold it
because of their markup. What the on-site work does is make Vantra *eligible* — and
make it the easiest of the candidates to quote, which is the part that
disproportionately matters for answer engines rather than for classic ranking.

The gap between eligible and cited is `offsite-backlog.md`, and closing it is
months of consistent, non-technical work. Any consultant who tells you otherwise is
selling schema markup.
