---
title: "Design system tooling without the platform"
description: "Twenty browser tools and local-first products for the unglamorous parts of design systems. All in one place, because they did not exist as one before."
author:
  name: "Kai Kauper"
  role: "Design systems lead"
datePublished: "2026-08-14"
lede:
  - "Vantra is a collection of [twenty browser-based utilities](/tools) and a set of local-first, open-source products for the parts of design systems nobody photographs. Contrast ratios, component drift, deprecation timelines, the accessible name of a button. It exists because these things did not live in one place before, and scattering them across a dozen bookmarked tabs was its own kind of problem."
  - "This is an independent project, published openly because a tool about accountability should be accountable first. There is no team, no investors, and no roadmap written for a board."
---

## What problem does Vantra solve?

Design system tooling today falls into two traps. The first is generality: directories and platforms that list everything and help with nothing in particular. The second is isolation: each tool knows one part of your system and nothing about the rest. A contrast checker knows your colours but not your components. A component linter knows your components but not who depends on them. An audit tool knows what is wrong but cannot tell you who breaks if you fix it.

Vantra starts from the opposite end. One shared library, [Vantra Core](/how-it-works), reads the tokens and the component graph from your actual repository, and everything else is a question asked of that reading. An accessibility fixer, a screenreader emulator, a maturity assessment: different instruments, one shared understanding of what your system contains.

The gap this fills is not discovery but action. Knowing that you have four buttons named Button is the easy half. Knowing who breaks if you remove three of them is the hard half, and that is the half most tooling skips.

## The small tools matter too

You need an aspect ratio for a responsive thumbnail. You need a `clamp()` value for fluid type. You need to check whether your brand blue passes AA on your surface colour. Each of these has a tool somewhere online, buried in a bookmark folder you last organised six months ago.

That bookmark folder was itself a reason Vantra needed to exist. [Twenty browser tools](/tools) now cover this arithmetic: contrast checking, type scales, spacing grids, easing curves, colour ramps, unit conversions, layout builders, and more. They require no account and compute everything locally.

These are not side projects to the larger products. Half of design systems work is exactly this kind of calculation, tedious to do by hand and easy to get wrong by eye. Having it all in one place, with consistent interaction patterns, is as useful on a Tuesday afternoon as any governance tool.

## Why local-first?

A contrast checker reads every colour on your page. A design reviewer reads your component source. An accessibility fixer reads the rendered DOM of your staging environment. These are exactly the kinds of access that should never be paired with a network request.

Local-first is not a marketing feature. It is a constraint that follows from what the tools do. Every Vantra tool runs on your machine or in your browser. There is no account, no upload, no telemetry, and no server to trust. That is also why they work behind a VPN, on a staging build, on a page you cannot share with a third party.

## Why open source?

Governance tooling you cannot inspect is just an opinion with a process around it. If a tool claims to measure whether your design system follows its own rules, you should be able to read how the measurement works.

Open source is the natural choice for other reasons too. Every Vantra repository is public from the start, including the parts that are not finished and the decisions that turned out to be wrong. The commit history is the track record, not a curated changelog. If a scoring algorithm changes, the diff is public. If a design decision was reversed, the issue thread explains why.

Design systems exist in every front-end stack, every token format, every component convention. No single person can anticipate all of them. Open source means someone working with a framework Vantra does not yet support can file an issue or extend the parser, and the fix benefits everyone using the same format.

The licences vary by project. [Vantra Core](https://github.com/vantradesign/vantra-core) is AGPL-3.0, so improvements to the parsing engine stay open. The [Maturity Check](https://github.com/vantradesign/vantra-maturity-check) is MIT, meant to be forked. The [Auto-Fixer](https://github.com/vantradesign/vantra-a11y-fixer) is MPL-2.0, matching its bundled dependency. Each licence fits the tool, not a blanket policy.

## How this gets built

Vantra is an independent project. The pace is set by what can be done carefully rather than what would make a good pitch.

Design system teams are used to tools that appear fully formed and then pivot, stall, or raise prices. Vantra trades that for something smaller and more verifiable: everything is on [GitHub](https://github.com/vantradesign), the commit history is the track record, and the parts that are not ready say so.
