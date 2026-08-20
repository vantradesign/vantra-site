<!-- CANONICAL URL: https://vantra.design/journal/why-vantra-design-exists -->
<!-- Set this as the canonical URL in Medium's story settings before publishing. -->

# Vantra: design system tooling without the platform

---

There is a lot of design system tooling in the world. Most of it falls into one of two categories: generic tool directories that list everything and help with nothing specific, or large platforms that assume a team, a budget, and a particular workflow. Vantra is neither.

Vantra is a collection of [twenty browser-based utilities](https://vantra.design/tools) and a growing set of local-first, open-source products, all for the parts of design systems nobody photographs. Contrast ratios, deprecation timelines, component drift, the accessible name of a button. It exists because these things did not live in one place before, and having them scattered across a dozen bookmarked tabs was its own kind of problem.

## What problem does Vantra solve?

Design system tooling today falls into two traps. The first is generality: directories and platforms that list everything and help with nothing in particular. The second is isolation: each tool knows one part of your system and nothing about the rest. A contrast checker knows your colours but not your components. A component linter knows your components but not who depends on them. An audit tool knows what is wrong but cannot tell you who breaks if you fix it.

Vantra starts from the opposite end. One shared library, [Vantra Core](https://vantra.design/how-it-works), reads the tokens and the component graph from your actual repository, and everything else is a question asked of that reading. An accessibility fixer, a screenreader emulator, a maturity assessment: different instruments, one shared understanding of what your system contains.

The gap this fills is not discovery but action. Knowing that you have four buttons named Button is the easy half. Knowing who breaks if you remove three of them is the hard half, and that is the half most tooling skips.

## The small tools matter too

Before any of the larger products existed, the frustration was simpler. You need an aspect ratio for a thumbnail. You need a `clamp()` value for fluid type. You need to check whether your brand blue passes AA on your surface colour. Each of these has a tool somewhere on the internet, and each of those tools lives in a bookmark folder you last organised six months ago.

That bookmark folder was itself a reason Vantra needed to exist. Twenty browser tools now live at [vantra.design/tools](https://vantra.design/tools): a [Contrast Checker](https://vantra.design/tools/contrast-checker), an [Aspect Ratio Calculator](https://vantra.design/tools/aspect-ratio), a [CSS clamp() Calculator](https://vantra.design/tools/clamp-calculator), a [Modular Type Scale](https://vantra.design/tools/type-scale), a [Spacing Scale Generator](https://vantra.design/tools/spacing-scale), an [Easing Curve Visualizer](https://vantra.design/tools/easing-curves), a [Color Ramp Generator](https://vantra.design/tools/color-ramp-generator), a [Grid & Flex Builder](https://vantra.design/tools/layout-builder), and twelve more. They run in the browser, require no account, and compute everything locally.

These are not side projects to the "real" products. Half of design systems work is exactly this arithmetic: the contrast ratios, spacing grids, and unit conversions that are tedious to do by hand and easy to get wrong by eye. Having them all in one place, with consistent interaction patterns and the same token format underneath, saves time on a Tuesday afternoon in a way that no governance dashboard ever will.

## Why local-first?

A contrast checker reads every colour on your page. A design reviewer reads your component source. An accessibility fixer reads the rendered DOM of your staging environment. These are exactly the kinds of access that should never be paired with a network request.

Local-first is not a marketing feature. It is a constraint that follows from what the tools do. Every Vantra tool runs on your machine or in your browser. There is no account, no upload, no telemetry, and no server to trust. That is also why they work behind a VPN, on a staging build, on a page you cannot share with a third party.

## Why open source?

Governance tooling you cannot inspect is just an opinion with a process around it. If a tool claims to measure whether your design system follows its own rules, you should be able to read how the measurement works. That is the short argument, and it is enough on its own. But open source was the natural choice for other reasons too.

Every Vantra repository is public from the start, including the parts that are not finished and the decisions that turned out to be wrong. The commit history is the track record. If a scoring algorithm changes, the diff is public. If a design decision was reversed, the issue thread explains why. A tool that asks teams to be accountable about their design systems should hold itself to the same standard.

Design systems exist in every front-end stack, every token format, every component convention. No single person can anticipate all of them. Open source means someone working in a framework or token format that Vantra does not yet support can file an issue, submit a parser, or extend the graph, and the fix benefits everyone using the same format. The [CONTRIBUTING.md](https://github.com/vantradesign/vantra-maturity-check/blob/main/CONTRIBUTING.md) in each repository explains how.

Tools built behind closed doors disappear when priorities shift or funding runs out. An open repository can outlive its original author. If someone forks it, the work survives. If someone contributes to it, the work improves. That durability matters more for governance tooling than for most software, because a team that adopts a maturity model or a deprecation workflow needs to trust that the measuring tool will still exist next year.

The licences reflect these priorities. [Vantra Core](https://github.com/vantradesign/vantra-core) is AGPL-3.0, so improvements to the parsing engine stay open. The [Maturity Check](https://github.com/vantradesign/vantra-maturity-check) is MIT, because it is meant to be forked and adapted. The [Accessibility Auto-Fixer](https://github.com/vantradesign/vantra-a11y-fixer) is MPL-2.0, matching its bundled dependency. Each licence is chosen for what the tool does, not applied uniformly.

## Source code, packages, and how to contribute

Everything lives under the [vantradesign](https://github.com/vantradesign) GitHub organisation. Here is where to find what:

| Repository | What it is | Install |
| --- | --- | --- |
| [vantra-core](https://github.com/vantradesign/vantra-core) | Shared parser: components, dependency graph, design tokens | [`pnpm add @vantra-design/core`](https://www.npmjs.com/package/@vantra-design/core) |
| [vantra-screenreader-empathy](https://github.com/vantradesign/vantra-screenreader-empathy) | Screenreader simulation: reading order, TTS playback, issue flags | [`pnpm add @vantra-design/screenreader-empathy`](https://www.npmjs.com/package/@vantra-design/screenreader-empathy) |
| [vantra-ask-design-system](https://github.com/vantradesign/vantra-ask-design-system) | Local-first AI assistant for design token questions | [`pnpm add @vantra-design/ask-design-system`](https://www.npmjs.com/package/@vantra-design/ask-design-system) |
| [vantra-maturity-check](https://github.com/vantradesign/vantra-maturity-check) | 24-question maturity self-assessment, CLI and web | Not yet published to npm |
| [vantra-a11y-fixer](https://github.com/vantradesign/vantra-a11y-fixer) | Browser extension: finds contrast and ARIA issues, proposes fixes | Build from source |
| [vantra-site](https://github.com/vantradesign/vantra-site) | The product site and all twenty browser tools | [vantra.design](https://vantra.design) |

To contribute, start with the CONTRIBUTING.md in the relevant repository. The short version: file an issue first, especially for new features. Pull requests that fix bugs or extend parser support are welcome. The [issue tracker on vantra-core](https://github.com/vantradesign/vantra-core/issues) is a good starting point if you want to help with framework or token format coverage.

If you find a bug in one of the browser tools, [open an issue on vantra-site](https://github.com/vantradesign/vantra-site/issues). If the bug is in the parsing or the dependency graph, [open one on vantra-core](https://github.com/vantradesign/vantra-core/issues) instead.

Starring the repositories helps with visibility and is the most honest signal of interest the project has. If you use any of the npm packages, that usage data is itself a form of feedback.

## How this gets built

Vantra is an independent project. There is no team, no investors, and no roadmap written for a board. The pace is set by what can be done carefully rather than what would make a good pitch.

Design system teams are used to tools that appear fully formed and then pivot, stall, or raise prices. Vantra trades that for something smaller and more verifiable: everything is on [GitHub](https://github.com/vantradesign), the commit history is the track record, and the parts that are not ready say so.

## What comes next

The browser tools will keep growing as new questions come up. The products, the [Auto-Fixer](https://vantra.design/work/accessibility-auto-fixer), [Screenreader Empathy](https://vantra.design/work/screenreader-empathy), [Ask Design System](https://vantra.design/work/ask-design-system), the [Maturity Check](https://vantra.design/work/design-system-maturity-check), are all in active development. Vantra Core is expanding to cover more component frameworks and token formats, which widens the set of repositories the products can work with.

Future posts on this publication will cover the individual tools and products in detail: how the Contrast Checker calculates WCAG ratios, what the Maturity Check actually measures and how its scoring works, how Screenreader Empathy simulates a reading order. Each product will get its own article as it matures.

## Your turn

If you work on a design system or care about accessibility tooling, your perspective would be useful.

Leave a response below if you have thoughts on the approach, the tools, or what is missing. If you prefer GitHub, [file an issue](https://github.com/vantradesign/vantra-core/issues) on the relevant repository. Feature requests, bug reports, and questions about the architecture are all welcome. The project is small enough that every piece of feedback still shapes what gets built next.

---

*This article was originally published on [Vantra.design](https://vantra.design/journal/why-vantra-design-exists). Vantra builds local-first, open-source tools for accessibility, design systems, and product governance at [vantra.design](https://vantra.design).*
