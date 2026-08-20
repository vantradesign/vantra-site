---
title: "What to expect from Vantra: direction, not deadlines"
description: "Where Vantra is heading: more tools, a deeper Core, and Figma plugins being explored. Honest intent without hard ship dates."
author:
  name: "Kai Kauper"
  role: "Design systems lead"
datePublished: "2026-08-14"
lede:
  - "Vantra is heading toward more tools, a deeper Core, and new surfaces — including, likely, Figma plugins. These are honest intentions, not hard commitments. No dates, no \"launching Q3,\" just the direction the work is taking and why."
  - "The short version: the [twenty browser tools](/tools) will keep growing, the products that watch systems over time will ship one at a time, and Vantra Core will keep expanding the range of repositories it can read."
---

## Where is the tool suite heading?

The twenty browser tools — contrast checking, type scales, easing curves, spacing scales, clamp() calculations, grid and flex layouts, colour ramps, breakpoints, focus rings, icon grids, dark-mode previews, and more — are the visible surface of Vantra today. They are free, they run in the browser, and they will stay that way. New tools will join as the set of questions worth answering grows.

The larger investment is in the products: tools that watch a design system over time rather than answering one question and closing the tab. The [Accessibility Auto-Fixer](/work/accessibility-auto-fixer) reads a rendered page and proposes fixes as diffs — and now includes a built-in Empathy tab for live screenreader simulation. The AI Design Reviewer compares a component against the system it belongs to. [Screenreader Empathy](/work/screenreader-empathy) walks the reading order and plays it back aloud. These are slower to build because they are harder to get right — a tool that watches your system continuously has to be trustworthy continuously.

## What is happening with Vantra Core?

Vantra Core is the shared parser that every product builds on. It answers three questions: what components exist, what depends on what, and what design tokens are declared. Every product reads your repository through Core, which is why their findings cite your specific tokens rather than a generic rulebook.

The roadmap for Core is breadth: more component frameworks beyond Vue and React, more token formats beyond DTCG and CSS custom properties, more ways to describe the public surface of a component. The wider Core reads, the more repositories the products can work with — and none of that breadth ships to your users, because Core is a build-time library with no runtime.

## Are Figma plugins on the horizon?

They are being explored, not promised. The natural extension is a plugin that reads the same Core data and surfaces it inside the design tool — a designer could see whether a token they are using still exists in the codebase, or whether a component has been deprecated, without leaving Figma.

But Figma plugins are a different distribution surface with different constraints: review processes, update cycles, and a sandboxed runtime that cannot read a local repository the way a CLI can. Shipping a plugin that works unreliably would be worse than shipping none. When there is something solid enough to show, it will appear on this site.

## Will any of this cost money?

The browser utilities are free and will stay free. The products — the Auto-Fixer, the Design Reviewer, the governance suite — may eventually have paid tiers. The [Maturity Checker](/work/design-system-maturity-check) CLI will remain open source.

The honest answer is that the pricing model is not decided, and saying so is better than inventing a number that might not survive contact with reality.
