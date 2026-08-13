# SEO & AI-citation monitoring runbook

A checking loop, not a dashboard. Everything here is deliberately cheap enough to
actually get done — a monitoring process that takes an hour a week gets abandoned
in three weeks, and an abandoned process is worse than none because it produces a
false sense of coverage.

**Total ongoing cost: ~15 minutes weekly, ~40 minutes monthly.**

---

## Before anything else: one-time setup

Nothing in this runbook produces data until these are done.

- [ ] **Google Search Console** — verify `vantra.design`, submit
      `https://vantra.design/sitemap.xml`.
- [ ] **Bing Webmaster Tools** — same. Bing is the index behind ChatGPT search and
      Copilot, so it matters more here than its market share suggests.
- [ ] Confirm `https://vantra.design/robots.txt`, `/sitemap.xml` and `/llms.txt`
      all return HTTP 200 with `content-type: text/plain` (or `application/xml`)
      on the **deployed** site. `public/_headers` is not enforced at build time —
      verify against the real response.
- [ ] Create the log file (see *Where results go* below).

---

## Weekly — 15 minutes

### 1. Automated checks (2 min)

```bash
pnpm run generate && pnpm run verify:seo
```

Must exit 0. This catches a regression in canonicals, JSON-LD validity, breadcrumb
structure, sitemap consistency, or an accidental `noindex` — none of which are
visible in a normal review.

### 2. Google Search Console (5 min)

Only three things, in this order:

1. **Pages → Not indexed.** Any new reason appearing here is the highest-priority
   signal in this runbook. A page moving to "Crawled — currently not indexed"
   usually means thin or duplicated content.
2. **Performance → Queries**, last 7 days vs previous 7. Note impressions for the
   target queries even when clicks are zero — impressions move first, and they
   move weeks before position does.
3. **Enhancements / Rich results.** Any new structured-data error.

### 3. AI citation spot-check (8 min)

The core GEO measurement, and there is no reliable free API for it — each platform
must be checked by hand. Keep it to **three queries across three platforms**, the
same ones every week, so the results are comparable.

| Platform | How to check | What to record |
| --- | --- | --- |
| **Google AI Overviews** | Search the query logged out, in an incognito window. | Did an AI Overview appear at all? Was `vantra.design` cited? Which domains were? |
| **ChatGPT** | Ask the query in a new chat with web search enabled. | Was Vantra named or linked? Which sources were cited? |
| **Perplexity** | Ask the query. | Vantra's position in the source list, if present. |

**Rotate three queries per week** from this set so all get covered monthly:

- `css clamp calculator`
- `clamp font generator`
- `fluid typography formula`
- `css grid generator`
- `grid vs flexbox when to use`
- `wcag contrast checker`
- `modular type scale generator`
- `open source design system tools`

Two things to know so the results are not misread:

- **Each platform cites differently.** Perplexity leans on recent web results,
  ChatGPT mixes retrieval with training knowledge, AI Overviews weight
  traditional ranking signals heavily. Absence from one is not absence from all.
- **Answers are non-deterministic.** The same query can return different sources
  an hour apart. A single miss is noise; a four-week trend is signal. Do not react
  to one week's result.

---

## Monthly — 40 minutes

- [ ] **Rank positions** for all eight target queries, logged out and
      location-normalised. GSC average position is sufficient — a paid rank
      tracker is not justified at this traffic level.
- [ ] **Core Web Vitals**, from GSC field data if available, otherwise PageSpeed
      Insights on three real templates: `/`, `/tools/layout-builder` (heaviest —
      the only page with substantial drag interaction, so the one to watch for
      **INP**) and `/work/accessibility-auto-fixer` (most media, so **LCP** and
      **CLS**). Do not measure only the home page.
- [ ] **Referring domains.** Any free backlink checker. The number matters less
      than the direction, and whether the off-site backlog is producing anything.
- [ ] **Citation share of voice.** Across the month's spot-checks: in how many of
      the ~12 platform-query combinations did Vantra appear? That single
      percentage is the headline GEO metric. Expect 0% for the first few months —
      that is the off-site backlog's timeline, not a failure of the on-site work.
- [ ] **Verify the reference-layer source links** still resolve (they are all
      MDN, W3C and WCAG URLs, which are stable but not immortal).

## Quarterly — with the content refresh

- [ ] Work the refresh cadence table in `docs/seo/offsite-backlog.md`.
- [ ] Re-check the specific browser-support and spec claims in
      `data/tool-reference.ts`. These are the most likely statements in this repo
      to become quietly false.
- [ ] Re-run the deferred audit items: is OG-1 (the 1200×630 share image) still
      outstanding? Has CWV-1 been measured on production yet?

---

## Where results go

Create `docs/seo/log.md` and append. One table, newest entry at the top, one row
per check. Plain markdown in the repo, deliberately:

- it is versioned, so a change in rankings sits beside the commit that may have
  caused it
- it needs no account, no subscription and no integration
- it is diffable, which is what makes a trend visible at all

Suggested shape:

| Date | Check | Result | Action taken |
| --- | --- | --- | --- |
| 2026-08-13 | `verify:seo` | 23 pages, 0 failures | — |
| 2026-08-13 | Setup | GSC + Bing not yet verified | Blocking all data collection |

**One rule: log the zeros.** "No AI Overview appeared for this query" and "not
cited" are the measurements that make the eventual first citation legible as
progress rather than noise.

---

## What would justify more tooling

Not yet, but the thresholds are worth naming so the decision is not made on
impulse:

- **A paid rank tracker** — once organic clicks exceed roughly 100/week, i.e.
  when position changes have measurable revenue or signup consequences.
- **A dedicated AI-visibility tool** (Profound, Peec, Otterly and similar) — once
  the manual spot-check shows Vantra appearing at all. Paying to track a citation
  share that is currently zero measures nothing.
- **CI integration of `verify:seo`** — worth doing as soon as anyone other than
  you commits to this repo. Add it to `.github/workflows/` after the `generate`
  step; it already exits non-zero, so it needs no wrapper.
