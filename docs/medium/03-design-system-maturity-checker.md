<!-- CANONICAL URL: https://vantra.design/journal/design-system-maturity-checker -->
<!-- Set this as the canonical URL in Medium's story settings before publishing. -->

# Design system maturity: what it means and how to measure it

*Kai Kauper, design systems lead*

---

Every design system team, at some point, gets asked where they are on a maturity model. The answer is usually a number plucked from a slide that describes five levels and offers no instructions for reaching the next one. The slide exists in every deck about design systems. The instructions almost never do.

That is the gap the [Vantra Maturity Checker](https://vantra.design/work/design-system-maturity-check) is built to close. It is a 24-question self-assessment that scores four dimensions (documentation, versioning, governance, and adoption) and returns concrete, effort-tagged next steps for each level reached. It runs in the terminal, takes about ten minutes, and requires no account or network connection. But before talking about the tool, it is worth being precise about the concept it measures.

## What does "design system maturity" actually mean?

Design system maturity is the degree to which a system's processes, documentation, and governance support its consumers reliably over time. A mature design system is more than a component library. It has documentation that works without asking its author, versioning that communicates breaking changes before they break anything, governance that answers who decides and how fast, and real evidence that teams adopt what the system provides.

Most maturity models describe these levels but stop at the diagnosis. They tell a team it is level 2 and offer nothing for level 3. Five columns on a slide, no instructions. The gap was never the diagnosis; it was knowing which three things to change before the next quarter.

## What does the Maturity Checker actually measure?

Four dimensions, six questions each, covering the ground where design systems most commonly fail:

| Dimension | The question behind the questions |
| --- | --- |
| Documentation | Can a new team use a component without asking anyone? |
| Versioning | Can you ship a breaking change without breaking trust? |
| Governance | Who decides, how fast, and is that written down? |
| Adoption | Do teams actually use it, and do you know? |

Five levels, from Ad hoc to Optimising, deliberately non-judgemental. The report states where a team is and what to do next. It never calls a system immature, because a two-person team with one product may be right to stay at level 2.

## How does the scoring work?

Answer options are worth one to five points, and each question carries a weight of one to three so that load-bearing practices count more than nice-to-haves. A category score is the weighted mean of its answered questions. The overall score is the unweighted mean of the four category scores, so no single dimension can dominate by having more questions.

Unanswered questions are excluded, never counted as zero. This matters because an honest "I don't know" should not be punished. It is itself useful information, not a failure. The bands are concrete: below 1.5 is level 1, below 2.5 level 2, below 3.5 level 3, below 4.5 level 4, and above that level 5.

The scoring model draws on established maturity frameworks (CMMI's five-level structure and design-system-specific work by practitioners like Brad Frost and Nathan Curtis) but the question catalog, weighting, and next-steps layer are original to Vantra.

## How would someone actually use it?

Run the CLI in a terminal. Answer 24 questions, each with five options and an optional "I don't know." The assessment takes roughly ten minutes.

The report shows a score and a level for each of the four dimensions, plus an overall score. More importantly, it shows three next steps per dimension, written specifically for the level reached. A level-2 team gets level-2 advice. A level-4 team gets level-4 advice. The next steps are tagged with effort (small, medium, or large) so a team can pick what is achievable this quarter rather than what sounds most ambitious.

The JSON export is the persistence layer. There is no database and no server. Re-import last quarter's file and the report renders the delta: what changed, what stayed, and whether the changes landed in the dimensions the team intended to improve.

## Why does maturity matter practically?

A design system without clear maturity practices breaks trust in specific, predictable ways. Documentation rots, so teams stop reading it and start asking in Slack. Versioning is unclear, so consumers pin to old versions rather than risk an upgrade. Governance is folklore, so decisions take longer each quarter. Adoption is unmeasured, so nobody knows whether the system is used or just exists.

None of these are dramatic failures. They are slow, quiet, and entirely fixable, but only if someone makes them visible. The maturity score is not a grade. It is a conversation starter, and the next steps are the conversation.

---

*This article was originally published on [Vantra.design](https://vantra.design/journal/design-system-maturity-checker). Vantra builds local-first, open-source tools for accessibility, design systems, and product governance at [vantra.design](https://vantra.design).*
