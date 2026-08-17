<!-- CANONICAL URL: https://vantra.design/journal/what-to-expect-from-vantra -->
<!-- Set this as the canonical URL in Medium's story settings before publishing. -->

# What to expect from Vantra: direction, not deadlines

*Kai Kauper, design systems lead*

---

People ask where Vantra is heading. The fair answer is: more tools, a deeper Core, and new surfaces — including, probably, Figma plugins. But these are honest intentions, not product announcements. There are no ship dates here, because inventing dates that might not survive contact with reality would be a worse kind of communication than saying "we're working on it."

Here is what the direction actually looks like, and the reasoning behind it.

## Where is the tool suite heading?

The [eleven browser utilities](https://vantra.design/tools) — contrast checking, type scales, easing curves, spacing scales, clamp() calculations, grid and flex layouts — are the visible surface of Vantra today. They are free, they run in the browser, and they will stay that way. New utilities will join as the set of questions worth answering grows.

The larger investment is in the products: tools that watch a design system over time rather than answering one question and closing the tab. The [Accessibility Auto-Fixer](https://vantra.design/work/accessibility-auto-fixer) reads a rendered page and proposes fixes as diffs. The AI Design Reviewer compares a component against the system it belongs to. The Deprecation Lifecycle Orchestrator follows a removal from announcement to the last consumer. These are slower to build because they are harder to get right — a tool that watches your system continuously has to be trustworthy continuously.

## What is happening with Vantra Core?

Vantra Core is the shared parser that every product builds on. It answers three questions: what components exist, what depends on what, and what design tokens are declared. Every product reads your repository through Core, which is why their findings cite your specific tokens rather than a generic rulebook.

The roadmap for Core is breadth: more component frameworks beyond Vue and React, more token formats beyond DTCG and CSS custom properties, more ways to describe the public surface of a component. The wider Core reads, the more repositories the products can work with — and none of that breadth ships to your users, because Core is a build-time library with no runtime.

## Are Figma plugins on the horizon?

They are being explored, not promised. The natural extension is a plugin that reads the same Core data and surfaces it inside the design tool — a designer could see whether a token they are using still exists in the codebase, or whether a component has been deprecated, without leaving Figma.

But Figma plugins are a different distribution surface with different constraints: review processes, update cycles, and a sandboxed runtime that cannot read a local repository the way a CLI can. Shipping a plugin that works unreliably would be worse than shipping none. When there is something solid enough to show, it will appear on the site.

## Will any of this cost money?

The browser utilities are free and will stay free. The products — the Auto-Fixer, the Design Reviewer, the governance suite — may eventually have paid tiers. The [Maturity Checker](https://vantra.design/work/design-system-maturity-check) CLI will remain open source.

The honest answer is that the pricing model is not decided, and saying so is better than inventing a number that might not survive contact with reality.

---

*This article was originally published on [Vantra.design](https://vantra.design/journal/what-to-expect-from-vantra). Vantra builds local-first, open-source tools for accessibility, design systems, and product governance at [vantra.design](https://vantra.design).*
