---
title: "Vantra tools: eleven free utilities and the Contrast Checker up close"
description: "All eleven free Vantra browser tools in one list, plus a deep dive on the Contrast Checker — what it calculates and why contrast matters."
author:
  name: "Kai Kauper"
  role: "Design systems lead"
datePublished: "2026-08-14"
lede:
  - "Vantra currently includes [eleven free browser tools](/tools) for colour, type, layout, motion and unit work, plus five products that watch design systems over time. This article covers both: a scannable overview of every tool and what it does, followed by a closer look at the [Contrast Checker](/tools/contrast-checker)."
  - "The Contrast Checker was chosen for the deep dive because it connects directly to Vantra's core mission — accessibility — and because it illustrates the relationship between the quick-answer utilities and the longer-running products like the [Accessibility Auto-Fixer](/work/accessibility-auto-fixer)."
---

## What tools does Vantra include?

All eleven utilities run in the browser, require no account, and compute everything locally. Nothing is uploaded. The set covers the arithmetic underneath a design system: the contrast ratios, type scales, spacing grids, and motion curves that are boring to calculate by hand and easy to get wrong by eye.

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

## What about the larger products?

Beyond the utilities, Vantra includes five products that work at a longer timescale. The [Accessibility Auto-Fixer](/work/accessibility-auto-fixer) finds contrast and ARIA failures on a rendered page and proposes fixes as diffs. The AI Design Reviewer compares a component against the design system it claims to belong to. The [Deprecation Lifecycle Orchestrator](/work/deprecation-lifecycle-orchestrator) tracks a removal from announcement to the last consumer. The [Design System Maturity Check](/work/design-system-maturity-check) scores documentation, versioning, governance and adoption across 24 questions and returns next steps.

These are different from the utilities in one important way: they are not quick-answer tools. They watch a system, or assess it, or track a change through its lifecycle. Most of them read your repository through [Vantra Core](/how-it-works), which is why their findings cite your specific tokens and components rather than checking against a generic set of rules.

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

The Contrast Checker answers a question about two colours you already know. The [Accessibility Auto-Fixer](/work/accessibility-auto-fixer) answers the same question about every colour pair on a rendered page, including the ones you did not know were there — inherited opacity, cascaded backgrounds, theme overrides that resolve differently at runtime.

They are two views of the same problem at different scales. The utility is for the moment of choosing a colour. The product is for the moment of checking whether all the choices still hold after the page is assembled. Together they cover the contrast lifecycle from decision to verification — and because both use the same WCAG formula, their verdicts agree.
