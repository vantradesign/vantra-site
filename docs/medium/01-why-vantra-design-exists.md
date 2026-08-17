<!-- CANONICAL URL: https://vantra.design/journal/why-vantra-design-exists -->
<!-- Set this as the canonical URL in Medium's story settings before publishing. -->

# Why Vantra.design exists

*Kai Kauper, design systems lead*

---

There is a lot of design system tooling in the world. Most of it falls into one of two categories: generic tool directories that list everything and help with nothing specific, or large platforms that assume a team, a budget, and a particular workflow. Vantra is neither.

Vantra is a set of local-first, open-source tools for the parts of design systems nobody photographs — contrast ratios, deprecation timelines, component drift, the accessible name of a button. It exists because practical, specific tooling for people doing real design systems work is surprisingly hard to find. And it is not a funded startup. It is an independent project, built by one person, published openly because a tool about accountability should be accountable first.

## What problem does Vantra solve?

Design system tooling today falls into two traps. The first is generality: directories and platforms that list everything and help with nothing in particular. The second is isolation: each tool knows one part of your system and nothing about the rest. A contrast checker knows your colours but not your components. A component linter knows your components but not who depends on them. An audit tool knows what is wrong but cannot tell you who breaks if you fix it.

Vantra starts from the opposite end. One shared library — [Vantra Core](https://vantra.design/how-it-works) — reads the tokens and the component graph from your actual repository, and everything else is a question asked of that reading. A deprecation tracker, a design reviewer, an accessibility fixer: different instruments, one shared understanding of what your system contains.

The gap this fills is not discovery but action. Knowing that you have four buttons named Button is the easy half. Knowing who breaks if you remove three of them is the hard half, and that is the half most tooling skips.

## Why local-first?

A contrast checker reads every colour on your page. A design reviewer reads your component source. An accessibility fixer reads the rendered DOM of your staging environment. These are exactly the kinds of access that should never be paired with a network request.

Local-first is not a marketing feature — it is a constraint that follows from what the tools do. Every Vantra tool runs on your machine or in your browser. There is no account, no upload, no telemetry, and no server to trust. That is also why they work behind a VPN, on a staging build, on a page you cannot share with a third party.

## Why open source?

Governance tooling you cannot inspect is just an opinion with a process around it. If a tool claims to measure whether your design system follows its own rules, you should be able to read how the measurement works.

Every Vantra tool is published under an open-source licence. The repositories are public from the start — including the parts that are not finished, including the decisions that turned out to be wrong. That openness is not incidental. It is how the tools earn the kind of trust they ask for.

## Who is behind Vantra?

One person — Kai Kauper, working independently from Böblingen, Germany. There is no team, no investors, and no roadmap written for a board. The pace is set by what can be done carefully rather than what would make a good slide.

That honesty is itself a positioning choice. Design system teams are used to tools that appear fully formed and then pivot, stall, or raise prices. Vantra trades that for something smaller and more verifiable: everything is on GitHub, the commit history is the track record, and the parts that are not ready say so on the box.

---

*This article was originally published on [Vantra.design](https://vantra.design/journal/why-vantra-design-exists). Vantra builds local-first, open-source tools for accessibility, design systems, and product governance at [vantra.design](https://vantra.design).*
