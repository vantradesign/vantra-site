---
title: "Vantra Core: the shared foundation underneath every tool"
description: "Vantra Core is the shared parser every Vantra tool builds on. It reads tokens and the component graph so each tool starts from the same facts."
author:
  name: "Kai Kauper"
  role: "Design systems lead"
datePublished: "2026-08-14"
lede:
  - "Vantra Core is the shared parsing library that every Vantra product builds on. It reads a front-end repository and answers three questions: what components exist, what depends on what, and what design tokens are declared."
  - "By putting this in one library rather than in each tool separately, every Vantra product starts from the same facts about your system. Their findings are consistent, their vocabulary is shared, and a new tool does not need to reinvent the parser."
---

## What is Vantra Core?

Vantra Core, published as `@vantra-design/core`, is a TypeScript library with three APIs. `parseComponents()` reads a repository and returns a structured list of every component it finds, with props, exports, and the file they live in. `buildComponentGraph()` turns those components into a dependency graph: who imports whom, who breaks if something changes. `parseTokenSchema()` reads design tokens from CSS custom properties, DTCG JSON, or Style Dictionary files and normalises them into one comparable schema.

It has no runtime, no CLI, and no interface of its own. It is a dev dependency that reads your source and returns structured data. Nothing is written back, and nothing is sent anywhere.

## Why does it exist as a separate layer?

Without a shared parser, each tool would build its own. The [Accessibility Auto-Fixer](/work/accessibility-auto-fixer) would have one idea of your component tree, the Design Reviewer another, and the Deprecation Orchestrator a third. They would agree by accident and disagree by default. A finding from one tool would use different names than a finding from another, and a team trying to act on both would spend its time translating between them.

Core means they all start from the same reading of your repository. A component that Core identifies is the same component every tool sees. A token Core finds is the same token. A dependency edge in the graph is a fact rather than a guess.

## What does the separation buy a user?

Three things, mostly invisible until the second tool is installed.

Consistency: every tool references your tokens by the same canonical name and your components by the same file path. Comparability: a finding from the Auto-Fixer and a finding from the Design Reviewer can be correlated because they share identifiers. Speed: adding a new tool does not require writing a new parser; it requires asking a new question of an existing graph.

For someone using a single tool, Core is invisible infrastructure. For someone using two or three, it is why the tools feel like instruments in the same workshop rather than products from different vendors.

## Do I need to understand Core to use the tools?

Mostly no. If you are using a browser utility like the [Contrast Checker](/tools/contrast-checker), the type scale generator, or the clamp() calculator, Core is not involved at all. Those tools are self-contained and compute everything in the browser.

If you are using one of the products (the Auto-Fixer, the Maturity Checker), Core is involved under the hood, but you do not interact with it directly. The tool handles the parsing and presents you with findings in plain language.

Core matters directly if you are building something on top of Vantra: writing your own governance rules, extending the graph, or integrating the token schema into your build pipeline. [The "How it works" page](/how-it-works) covers that in detail.
