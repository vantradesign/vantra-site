# Off-site authority backlog

**This file contains no engineering work.** It is the advisory half of the
SEO/GEO engagement: the things that have to happen outside this repository for the
on-site work to produce rankings and citations.

Read `docs/seo/audit-2026-08.md` first for what was fixed in the codebase.

---

## Why this file is the more important one

The on-site work is now done to a high standard. It is also, by itself,
insufficient — and it is worth being blunt about why.

The queries in scope (`clamp font generator`, `grid generator`, `contrast
checker`, `open source design tools`) are all long-established, competitive, and
dominated by tools with years of accumulated links and community mentions. Those
incumbents do not rank because their markup is better. They rank because hundreds
of people have linked to them, and because when someone on Reddit asks "best clamp
calculator" the same three names appear in the replies.

That second mechanism is also how answer engines decide who to cite. The dominant
share of AI brand mentions originate off-site — from forums, repositories,
listicles, and community discussion — rather than from the brand's own domain. An
LLM assembling an answer about fluid typography is drawing on the corpus where
that topic is discussed, and this site is currently absent from it.

**So the realistic expectation is:** on-site work gets Vantra eligible, indexed,
and cleanly quotable. Off-site work is what gets it ranked and cited. Nothing in
this file can be done by an engineer in an afternoon, and no amount of further
schema will substitute for it.

---

## Priority 1 — Own the source-of-truth surfaces

Highest leverage, lowest cost, entirely under your control. These are surfaces
where you are permitted to describe your own work, and which LLMs weight heavily
because they are structured and heavily crawled.

| # | Action | Why it matters | Effort |
| --- | --- | --- | --- |
| 1.1 | **Fill out every `vantradesign` GitHub repo**: description, topics, and a README that names the hosted tool and links to its page. | GitHub is in every major model's training corpus and is crawled constantly. A repo with topics `css`, `clamp`, `fluid-typography`, `design-tokens`, `wcag` is a citation-grade entity description you wrote yourself. Currently several repos link only to the org root. | Low |
| 1.2 | **Add a `## Tools` section to the org profile README** (`.github/profile/README.md`) linking all twenty tools by name. | The org profile is the canonical landing page for the GitHub entity and is the first thing a model resolves from a `github.com/vantradesign` mention. | Low — the file is already open in this workspace |
| 1.3 | **Publish `@vantra-design/core` to npm** if not already public, with a complete `package.json` description, keywords and `homepage`. | npm package pages rank well and are a strong entity signal. `homepage` pointing at `vantra.design` is a first-party link from a high-authority domain. | Low |
| 1.4 | **Submit the sitemap in Google Search Console and Bing Webmaster Tools.** | Nothing above matters until the sitemap is submitted. Bing matters disproportionately here: it is the index behind ChatGPT search and Copilot. | Low — 15 minutes, do this first |

> **1.4 is the single most time-sensitive item in this file.** The sitemap now
> exists at `https://vantra.design/sitemap.xml` but no engine has been told.

## Priority 2 — Get into the discussions that get cited

This is the work that actually shifts AI citation share. It is also the work most
easily done badly: drive-by self-promotion gets removed, and gets the domain
associated with spam.

**The rule for all of it: answer the question first, link only if the link is the
best available answer.** A comment that solves someone's problem and happens to
link a tool is welcome. The reverse is not.

| # | Target | Approach | Notes |
| --- | --- | --- | --- |
| 2.1 | **r/css, r/web_design, r/Frontend, r/webdev** | Reddit is the most frequently cited domain in AI Overviews and is heavily weighted by ChatGPT and Perplexity. Find existing threads on fluid typography, clamp, and grid-vs-flex and answer them properly. | Reddit's own rules and each subreddit's self-promotion policy apply. Account age and comment history matter — a new account linking its own site reads as spam and will be removed. |
| 2.2 | **Stack Overflow answers** on `css-clamp`, `css-grid`, `responsive-typography` | Long-lived, heavily crawled, and cited by models. Answer with the formula and reasoning inline; the tool link is supplementary. | An answer that is only a link is deleted. The reference layer content in `data/tool-reference.ts` is written at the right level to adapt into real answers. |
| 2.3 | **dev.to / Hashnode articles** | One substantive article per topic cluster — the clamp formula derivation, why vw-only fluid type fails WCAG 1.4.4, grid vs flex decision criteria. Canonical back to the corresponding tool page. | These platforms rank fast and are well represented in training data. Set the canonical so the tool page keeps the authority. |
| 2.4 | **Hacker News — Show HN** | One post, for the whole tool set, once. Framed on the local-first and no-telemetry angle, which is genuinely differentiating and is the part HN cares about. | One shot only; a second Show HN for the same project is penalised. Wait until OG-1 (the share image) is resolved. |
| 2.5 | **CSS-Tricks / Smashing Magazine** | Pitch a technical article. Both accept external contributions and both are cited constantly by answer engines. | Long lead time. Highest single-item authority payoff in this table. |

## Priority 3 — Directories and aggregators

Lower per-item value, but cumulative, permanent, and mostly a form to fill in.

| # | Target | Notes |
| --- | --- | --- |
| 3.1 | **awesome-css / awesome-design-systems / awesome-a11y** GitHub lists | A PR adding a genuinely relevant tool. These lists are scraped, mirrored, and cited heavily. Read each list's contribution criteria — most require the tool to be free and open, which is true here. |
| 3.2 | **Product Hunt** | One launch for the tool set. Drives a burst of referral traffic and a permanent, well-ranked listing. |
| 3.3 | **Designer/developer tool directories** — e.g. Toolsforfrontend, CSS tools roundups, Bruno Simon-style link collections | Submit to those with genuine editorial standards. Skip anything that charges for a `dofollow` link: paid links violate Google's link spam policy and are a penalty risk. |
| 3.4 | **Wikipedia / Wikidata** | Do **not** add Vantra. It does not meet notability requirements and the edit will be reverted. Noted here only because it is a common suggestion in GEO advice and it is wrong at this stage. |

## Priority 4 — Content refresh cadence

Stale pages lose AI citations faster than they lose rankings: an answer engine
selecting between two sources prefers the one that appears current, and freshness
is weighted more heavily in generative retrieval than in classic ranking.

| Surface | Cadence | What to actually do |
| --- | --- | --- |
| The four priority tool pages (`clamp-calculator`, `layout-builder`, `type-scale`, `contrast-checker`) | **Quarterly** | Re-check the reference layer against the current spec and browser support. Add any question that has started appearing in search or in support mail. Verify every source URL still resolves. |
| Remaining sixteen tool pages | **Every 6 months** | Same, lighter. |
| `llms.txt` and the sitemap | **Automatic** | Both generate from `data/`. No maintenance — this is why they were built that way. |
| Browser-support claims in `data/tool-reference.ts` | **Quarterly, with the priority pages** | Specific claims exist about clamp() support and subgrid ship dates. These age. They are the most likely thing in this repo to become quietly false. |
| `/journal` | **On first post** | Remove the `noindex` in `pages/journal/index.vue` and the `/journal` entry in `EXCLUDED_FROM_SITEMAP` (`data/routes.ts`), in the same commit. |

---

## What not to do

Recorded because each is commonly recommended and each would cause real damage.

- **Do not buy links.** Any paid `dofollow` link violates Google's link spam
  policy. The risk is a manual action against the whole domain.
- **Do not mass-post the same comment across subreddits.** It is removed, and it
  associates the domain with spam in exactly the community that would otherwise
  have recommended it.
- **Do not serve different content to AI crawlers.** Cloaking is a policy
  violation and it is pointless — the crawler reads the pages too. This is why
  `llms.txt` is generated from the same `data/` modules the pages render from.
- **Do not add `FAQPage` markup for questions not visible on the page.** The
  implementation makes this structurally impossible, and it should stay that way.
- **Do not chase every keyword with a new thin page.** The audit consolidated
  toward deeper pages deliberately. Twenty strong tool pages beat forty weak ones,
  for both classic ranking and citation.
