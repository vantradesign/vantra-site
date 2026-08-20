# The reference layer — pattern and before/after

How the on-page restructuring works, what changed on each page, and how to add the
same thing to a new tool. This is the Phase 2 deliverable of the SEO/GEO
engagement.

---

## The problem it solves

This site has a documented editorial voice: magazine register, cover lines under
22 characters, prose rather than bullet lists, atmosphere before mechanism
(`README.md` § Art direction, `CLAUDE.md`). That voice is very effective at making
someone want to use a tool.

It is structurally incapable of answering "what is the CSS clamp formula".

Before this change, `/tools/clamp-calculator` opened with *"One value that knows
how wide the window is."* — a good cover line — followed by a working calculator.
The word "formula" appeared nowhere on the page. Neither did the phrase "fluid
typography". A person who already understood clamp() got a fast tool; a person
searching for how clamp() works got nothing, and neither did an answer engine
trying to assemble a response.

The naive fix is to rewrite the editorial copy into question-led headings and
TL;DR blocks. That trades a distinctive site for a generic one, and it contradicts
a convention the repo states explicitly.

**The pattern instead adds a second register rather than replacing the first.**

---

## The structure

Every tool page is now:

```text
ToolIntro          — editorial. Cover line + standfirst. Unchanged.
[the working tool] — unchanged.
ToolReference      — factual. New.
ToolFooterNav      — unchanged.
```

`ToolReference` renders, in order:

| Block | Purpose | GEO rationale |
| --- | --- | --- |
| **Answer** | One self-contained paragraph, under ~45 words, set at lead size. | The passage most likely to be lifted verbatim into an AI Overview or chat answer. Self-contained because it will be quoted without its surroundings. Under 45 words because longer blocks get truncated mid-clause. |
| **Sections** | `<h3>`s phrased as the question a person types, each with 2–3-sentence paragraphs, answer first. | One topic per heading, so a retriever can select the relevant passage rather than the whole page. Question phrasing matches real query and prompt language instead of keyword fragments. |
| **Table** | A comparison table, where the page does not already have one. | Models extract tabular relationships reliably and mangle the same content written as prose. |
| **FAQ** | 3–5 question/answer pairs in a plain `<dl>`. | Pre-segmented Q&A is the unit an answer is assembled from. Mirrored into `FAQPage` JSON-LD from the same array. |
| **Sources** | 2–3 real primary references. | MDN, W3C specs, WCAG understanding documents. Verifiable claims, and outbound links to authoritative sources are a quality signal for both audiences. |

### Three rules the implementation enforces

1. **Nothing is hidden.** No accordion, no tabs, no "read more". Collapsed text is
   text a crawler may weight lower and a keyboard user has to open.
2. **The visible answer and the schema answer are the same string.** `FAQPage`
   markup is generated from the same `faq` array the template renders, so they
   cannot drift. Markup describing hidden or absent content is a structured-data
   spam violation; here it is structurally impossible.
3. **The reference layer goes below the tool, never above it.** Someone who came
   to calculate a value gets the calculator first. Pushing the tool below the fold
   to serve a crawler is the trade this pattern exists to avoid.

---

## Before / after

Content structure only. No editorial copy was rewritten and no visual design
changed above the reference block.

| Page | Before | After |
| --- | --- | --- |
| `/tools/clamp-calculator` | Cover line, standfirst, calculator, copy-ready output. No explanation of clamp(), no formula, no mention of fluid typography or WCAG. | Unchanged above, plus: answer block stating the formula; 4 question-led sections (what clamp() does, how to calculate a fluid value, why the rem term is required, clamp() vs media queries); a 5-row table of worked declarations with resolved sizes at three viewports; 5 FAQs; 3 sources (MDN, CSS Values 4, WCAG 1.4.4). |
| `/tools/layout-builder` | Cover line, standfirst, builder, one note on the local model. | Plus: answer block on the Grid/Flex decision; 4 sections (Grid vs Flexbox, `grid-template-areas`, subgrid, responsive without media queries); a 7-row Grid-vs-Flexbox comparison table; 5 FAQs; 3 sources. |
| `/tools/contrast-checker` | Checker, verdict badges, copy-ready comment. WCAG thresholds visible only as badge labels. | Plus: answer block with the ratio formula; 3 sections; a 5-row WCAG minimums table including the exemptions; 4 FAQs; 3 W3C sources. |
| `/tools/type-scale` | Generator, specimen preview, CSS output. | Plus: answer block; 3 sections (how a modular scale is calculated, choosing a ratio, fluid vs static); a 5-row ratio table; 3 FAQs; 2 sources. |
| `/tools/aspect-ratio` | Calculator, preview, **existing** 8-row reference table. | Plus: answer block, 3 sections, 3 FAQs, 2 sources. **No table added** — the page already has one, and duplicating it would put the same rows on one URL twice. |
| `/tools/spacing-scale`, `/tools/unit-converter`, `/tools/easing-curves`, `/tools/shade-tint-generator`, `/tools/shadow-playground`, `/tools/font-pairing` | Tool plus editorial framing. | Same pattern. Tables where the page had none (spacing multipliers, px/rem/em/pt conversions, easing keyword equivalents); no table where a table would be padding. |

All twenty tool pages also gained, via `useToolPageSeo()`: a self-referencing
canonical, full Open Graph and Twitter tags, a `BreadcrumbList`, and a
`WebApplication` node with a `price: '0'` offer.

---

## Adding it to a new tool

Three steps. Nothing needs to be registered anywhere else.

**1.** Append an entry to `data/tool-reference.ts`, matching the `slug` in
`data/tools.ts`:

```ts
{
  slug: 'my-tool',
  answer: 'The direct answer, first sentence first, under about 45 words.',
  sections: [
    {
      heading: 'How does the thing work?',
      body: [
        'Answer in the first sentence. Then the supporting detail.',
        'Second paragraph, two to three sentences.',
      ],
    },
  ],
  table: {
    caption: 'Describes the table for screen readers and for a model.',
    columns: ['Thing', 'Value'],
    rows: [['A', '1']],
  },
  faq: [{ question: 'A real question?', answer: 'A complete, standalone answer.' }],
  sources: [{ label: 'MDN — the property', href: 'https://developer.mozilla.org/…' }],
}
```

**2.** Mount the component in the page, above `ToolFooterNav`:

```vue
<ToolReference slug="my-tool" />
```

**3.** Use the tool SEO composable instead of `useSeoMeta`:

```ts
useToolPageSeo({
  slug: 'my-tool',
  title: 'My Tool',
  description: 'Under 160 characters. What the page is, in its own words.',
})
```

Then `pnpm run generate && pnpm run verify:seo`. A slug with no reference entry
renders no reference section, so step 1 can lag steps 2 and 3.

### Content rules — non-negotiable

Restated from `types/reference.ts`, because these are what keep the layer
trustworthy:

- **Answer the question in the first sentence.** No preamble, no "in this
  article".
- **2–3 sentences per paragraph.** One topic per section.
- **Every number traceable to the implementation** in `utils/tools/`. If the page
  says the ramp holds hue and re-anchors lightness, `generateRamp()` must do that.
- **Sources are real, primary, and read.** MDN, W3C, WCAG. No blog posts, no
  invented statistics, nothing paraphrased from a source that was not opened.
- **A table only where the page has none.** Otherwise it is duplicate content.
- **No keyword stuffing.** The headings are questions because that is how people
  ask them, not to hit a phrase. Anything written for a crawler rather than a
  reader fails both.
