# PR summary — First 5 journal articles

## What was done

Five journal articles and their Medium-adapted versions, plus the structural
work needed to support journal content on the site.

### Structural changes

- **`@nuxt/content` v3** — Added as a dependency. Journal articles are stored
  as Markdown files in `content/journal/*.md` with YAML frontmatter for
  metadata (title, description, author, datePublished, lede). Article body
  content is standard Markdown rendered via `<ContentRenderer>`.
- **`content.config.ts`** — Defines the `journal` collection with a Zod schema
  for custom frontmatter fields (author, datePublished, lede).
- **`content/journal/*.md`** — Five article files, each with frontmatter and
  Markdown body.
- **`utils/schema.ts`** — Added `articleNode()` for Article JSON-LD. This is
  the first page type on the site with a `datePublished` field, which is valid
  because the date is visible on the article page (matching the schema rule
  that every field must restate something the visitor can see).
- **`pages/journal/[slug].vue`** — Dynamic article page using
  `queryCollection('journal')` and `<ContentRenderer>`. Lede from frontmatter,
  body from Markdown. Scoped CSS styles the rendered output to match the site
  typography.
- **`pages/journal/index.vue`** — Updated: `noindex` removed, article listing
  via `queryCollection('journal').order('datePublished', 'DESC').all()`.
- **`data/routes.ts`** — `/journal` moved from `EXCLUDED_FROM_SITEMAP` to
  `STATIC_ROUTES`. Journal article routes are queried from the content
  collection in `server/routes/sitemap.xml.ts` rather than a static import.
- **`server/routes/llms.txt.ts`** — Journal promoted from "stub" note to a
  real section; articles queried from the content collection at build time.
- **`server/routes/sitemap.xml.ts`** — Now async; queries the journal
  collection and merges article paths with the static routes.
- **`server/tsconfig.json`** — Added, extending `.nuxt/tsconfig.server.json`
  for `@nuxt/content` server-side type support.
- **`nuxt.config.ts`** — `@nuxt/content` added to modules.
- **`CLAUDE.md`** — Updated to note `content/journal/` exists.

### Removed

- **`data/journal.ts`** — Replaced by `content/journal/*.md`.
- **`types/journal.ts`** — Schema is now in `content.config.ts` via Zod.

### No changes to

- `types/product.ts`, `assets/css/main.css`, or the `MANIFEST.md` prompt
  template.
- No images generated or replaced.

---

## The 5 articles

| # | Slug | Title | Meta description |
|---|---|---|---|
| 1 | `why-vantra-design-exists` | Why Vantra.design exists | Vantra builds local-first, open-source tools for the unglamorous parts of design systems. This is why it exists and what makes it different. |
| 2 | `what-to-expect-from-vantra` | What to expect from Vantra: direction, not deadlines | Where Vantra is heading: more tools, a deeper Core, and Figma plugins being explored. Honest intent without hard ship dates. |
| 3 | `design-system-maturity-checker` | Design system maturity: what it means and how to measure it | Design system maturity measures how well a system supports its teams over time. The Vantra Maturity Checker scores four dimensions and returns next steps. |
| 4 | `what-is-vantra-core` | Vantra Core: the shared foundation underneath every tool | Vantra Core is the shared parser every Vantra tool builds on. It reads tokens and the component graph so each tool starts from the same facts. |
| 5 | `vantra-tools-overview` | Vantra tools: twenty free browser tools and the Contrast Checker up close | All twenty free Vantra browser tools in one list, plus a deep dive on the Contrast Checker — what it calculates and why contrast matters. |

---

## Article 5 — tool choice: Contrast Checker

The Contrast Checker was chosen for the deep-dive half because:

1. **Accessibility is Vantra's core mission area.** Contrast checking is the
   most direct intersection of design decisions and accessibility requirements.
2. **It links to the Auto-Fixer.** The article naturally bridges from a utility
   (check two colours) to a product (scan every colour on a page), illustrating
   the utility–product relationship that defines the tool suite.
3. **It is the first tool (index 01)**, universally understood, and the most
   broadly searched-for tool in the set — "contrast checker" has real search
   volume.

---

## Positioning language reused from README/site

The following phrases were taken directly from existing site copy and reused
in the articles to maintain brand consistency:

- "tools for the parts of a product nobody photographs" (home page manifesto)
- "governance you cannot inspect is just an opinion" (principles)
- "no account, no telemetry, no network calls" (product pages)
- "local-first, open-source" (site description)
- "the quiet parts of the interface" (cover line)
- "everything is on GitHub, including the parts that are not finished" (home page)
- "a finding is worth nothing without the fix beside it" (principles)
- "instruments in the same workshop" (adapted from how-it-works)

---

## Medium deviations

Five files in `docs/medium/`, one per article. Each includes:

- An HTML comment at the top with the exact canonical URL to set in Medium's
  story settings.
- A slightly more essay-like opening (less definition-lead, more narrative
  windup) compared to the site version's GEO-optimised quick-answer block.
- All facts, positioning, and tone identical to the site versions.
- A closing line linking back to the original article and to vantra.design.
- Links use absolute URLs (`https://vantra.design/...`) since they will be on
  Medium's domain.

---

## JSON-LD schema

Each article page emits an `Article` node via `articleNode()` in the page's
`@graph`, containing:

- `headline`, `description`, `datePublished` (visible on the page)
- `author` referencing the existing `Person` node (`#kai-kauper` on `/about`)
- `publisher` referencing the existing `Organization` node
- `dateModified` when set (not set on initial publication)

---

## Rendering verification

Journal pages are server-rendered/statically generated via `nuxt generate`,
consistent with the rest of the site. AI crawlers and traditional search
crawlers both receive fully rendered HTML with no client-side-only content.

---

## Open questions for the human reviewer before publishing

1. **Publication date.** All five articles are dated 2026-08-14 (today). Should
   they be staggered across different dates for a more natural publication
   cadence?
2. **Figma plugins (article 2).** Framed as "being explored, not promised." Is
   this the right level of specificity, or is there more concrete direction to
   share?
3. **Pricing (article 2).** States "the pricing model is not decided." Confirm
   this is the right message, or provide the actual pricing intent if one
   exists.
4. **Author role.** Set to "Design systems lead" across all five articles.
   Confirm this is the preferred attribution.
5. **`llms.txt` file.** The site already has a generated `llms.txt` at
   `server/routes/llms.txt.ts` — updated in this PR to list the journal
   articles. No additional work needed.
6. **Internal links within paragraphs** use plain `<a>` tags rendered via
   `v-html`, since the content is first-party data. This means internal links
   trigger full page loads rather than client-side navigation. For a
   prerendered static site the difference is negligible, but if client-side
   navigation is preferred, a custom rendering component could be added as a
   fast-follow.
