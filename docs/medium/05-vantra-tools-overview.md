<!-- CANONICAL URL: https://vantra.design/journal/vantra-tools-overview -->
<!-- Set this as the canonical URL in Medium's story settings before publishing. -->

# Vantra tools: twenty free browser tools and the Contrast Checker up close

*Kai Kauper, design systems lead*

---

Most design system work is not glamorous. It is contrast ratios, type scales, spacing grids, easing curves, and unit conversions — the arithmetic underneath the system, done over and over, easy to get wrong by eye and tedious to get right by hand.

Vantra currently includes [twenty free browser tools](https://vantra.design/tools) that cover exactly that arithmetic and more, plus five products that watch design systems at a longer timescale or make them more accessible. This article walks through both: a fast overview of every tool, followed by a closer look at the [Contrast Checker](https://vantra.design/tools/contrast-checker) — because it connects most directly to Vantra's core mission of accessibility, and because it illustrates the relationship between the quick-answer utilities and the longer-running products.

## What tools does Vantra include?

All twenty tools run in the browser, require no account, and compute everything locally. Nothing is uploaded.

| Tool | Discipline | What it does |
| --- | --- | --- |
| Contrast Checker | Colour | WCAG contrast between two colours, with the Vantra palette as presets. |
| Aspect Ratio Calculator | Layout | Ratio to dimension, dimension to ratio, and proportional resize. |
| Font Pairing Studio | Type | Curated typeface combinations, previewed as real editorial spreads. |
| Modular Type Scale | Type | A fluid or static typographic scale, as a specimen page. Emits clamp() per step. |
| Spacing Scale Generator | Layout | Ten spacing tokens on a 4pt or 8pt grid, fluid or static, drawn to proportion. |
| Shade & Tint Generator | Colour | A ten-step colour ramp from one hex value, contrast-checked at every step. |
| Easing Curve Visualizer | Motion | A cubic-bezier editor with a live preview and a keyboard-driven curve. |
| Unit Converter | Units | px, rem, em and pt, converted live against an adjustable root font size. |
| Radius & Shadow Playground | Layout | Layered box-shadow and border-radius, previewed on a real content card. |
| CSS clamp() Calculator | Units | One fluid value for a one-off size, with a viewport simulator to prove it. |
| Grid & Flex Builder | Layout | A visual grid and flex builder with subgrid, emitting plain CSS or Tailwind v4 classes. |
| Color Ramp Generator | Colour | An OKLCH ramp from one brand colour, saved into the shared token schema with contrast metadata. |
| Z-Index Planer | Layout | A documented, conflict-free z-index scale as named tokens, not arbitrary numbers. |
| Breakpoint Planer | Layout | Responsive breakpoint tokens with a live device-frame preview of how the layout reflows. |
| Icon Grid Checker | Assets | Check SVG icons against a keyline grid for stroke-width, viewBox and optical consistency. |
| Focus Ring Generator | Colour | Accessible focus-ring styles from your token schema colours, contrast-checked on the spot. |
| Dark Mode Flip Previewer | Colour | Preview your own light-mode tokens flipped to dark, with contrast validation per pair. |
| Empty State Generator | Content | Microcopy and layout templates for empty states — no-data, error, first-use — as editable component snippets. |
| Design System Maturity Check | Governance | A 24-question self-assessment across documentation, versioning, governance and adoption. |
| Screenreader Empathy | Accessibility | Paste HTML and hear what a screen reader would announce, node by node. Reading order, heading outline, landmark map and deterministic issue flags. |

The set is not random. It covers the arithmetic that sits underneath a design system — the contrast ratios, type scales, spacing grids, and motion curves that are boring to calculate by hand and easy to get wrong by eye — plus governance, icon, content and accessibility tools that go further.

## What about the larger products?

Beyond the utilities, Vantra includes five products that work at a longer timescale. The [Accessibility Auto-Fixer](https://vantra.design/work/accessibility-auto-fixer) finds contrast and ARIA failures on a rendered page and proposes fixes as diffs — and now includes a built-in Empathy tab that runs Screenreader Empathy on the live DOM. The AI Design Reviewer compares a component against the design system it claims to belong to. The [Ask Design System](https://vantra.design/work/ask-design-system) is a local-first AI assistant that answers natural-language questions about your design tokens — with optional voice input and output — entirely in the browser. The [Screenreader Empathy](https://vantra.design/work/screenreader-empathy) tool walks the reading order of your HTML, plays it back aloud node by node, and flags what is confusing — deterministically, with optional AI commentary. The [Design System Maturity Check](https://vantra.design/work/design-system-maturity-check) scores documentation, versioning, governance and adoption across 24 questions and returns next steps.

These are different from the utilities in one important way: they are not quick-answer tools. They watch a system, assess it, make it searchable, or let you experience it as a screen reader user would. Most of them read your repository or your tokens through [Vantra Core](https://vantra.design/how-it-works) or a local inference model, which is why their findings cite your specific data rather than checking against a generic set of rules.

## The Contrast Checker: what it calculates

The Contrast Checker takes two colours, computes the WCAG 2.2 contrast ratio, and reports whether the combination passes AA, AAA, or neither — at both normal and large text sizes. It is the first tool on the shelf and in some ways the simplest, but contrast checking is where design decisions and accessibility requirements meet most directly.

Under the hood, each colour's hex value is converted to relative luminance: the RGB channels are linearised and weighted — 0.2126 red, 0.7152 green, 0.0722 blue — reflecting human sensitivity to green light. The ratio is then (lighter + 0.05) / (darker + 0.05), producing a value between 1:1 and 21:1.

The Vantra palette is built in as presets, so checking your own tokens against each other is a selection rather than a copy-paste exercise. The output includes the exact ratio, the pass/fail verdict at each WCAG level, and a copy-ready CSS comment documenting the result — useful for embedding the accessibility decision directly in the stylesheet where the colour is declared.

## Why does contrast checking matter?

WCAG 2.2 success criterion 1.4.3 requires body text to meet a minimum contrast ratio of 4.5:1 against its background at AA conformance. Large text — 24px and above, or 19px bold — needs 3:1. Non-text elements such as input borders and focus indicators need 3:1 under criterion 1.4.11.

| Content | AA minimum | AAA minimum |
| --- | --- | --- |
| Body text (under 24px) | 4.5:1 | 7:1 |
| Large text (24px+, or 19px bold) | 3:1 | 4.5:1 |
| UI components and graphics | 3:1 | No higher requirement |
| Disabled controls | Exempt | Exempt |
| Logotypes | Exempt | Exempt |

These are not aspirational targets. In the EU (European Accessibility Act), the US (Section 508), and the UK (Equality Act), WCAG conformance carries legal weight. A contrast failure is both an accessibility barrier for real people and, increasingly, a compliance risk for the organisation shipping it.

The practical problem is not that teams do not care about contrast. It is that checking happens too late: after the design tokens are set, after the theme is implemented, after the component is reused eleven times. A contrast checker available during the design decision — while the colour is still being chosen — prevents the failure instead of reporting it.

## From the Contrast Checker to the Auto-Fixer

The Contrast Checker answers a question about two colours you already know. The [Accessibility Auto-Fixer](https://vantra.design/work/accessibility-auto-fixer) answers the same question about every colour pair on a rendered page, including the ones you did not know were there — inherited opacity, cascaded backgrounds, theme overrides that resolve differently at runtime.

They are two views of the same problem at different scales. The utility is for the moment of choosing a colour. The product is for the moment of checking whether all the choices still hold after the page is assembled. Together they cover the contrast lifecycle from decision to verification — and because both use the same WCAG formula, their verdicts agree.

---

*This article was originally published on [Vantra.design](https://vantra.design/journal/vantra-tools-overview). Vantra builds local-first, open-source tools for accessibility, design systems, and product governance at [vantra.design](https://vantra.design).*
