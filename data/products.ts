import type { Product } from '~/types/product'

export const products: Product[] = [
  {
    slug: 'accessibility-auto-fixer',
    name: 'Accessibility Auto-Fixer',
    index: '01',
    accent: 'cyan',
    coverLine: 'Built for the quiet parts of the interface.',
    summary:
      'A browser extension that finds contrast and ARIA failures on the page you are looking at, and proposes the fix locally.',
    status: 'in-development',
    license: 'MPL-2.0',
    mood: {
      src: '/editorial/01-auto-fixer-studio.avif',
      alt: 'A laptop on a plaster worktop in daylight, its screen showing the Accessibility Auto-Fixer panel with three contrast failures marked on a live page.',
      focal: '50% 40%',
      placeholder: true,
    },
    problem:
      'Accessibility work fails at the last mile. Audits arrive as spreadsheets weeks after the code shipped, written by a tool that never saw the rendered page. By the time anyone reads them, the component has been reused eleven times. The failures that matter are small, repetitive and entirely fixable — they just need to be found while the page is still on screen.',
    howItWorks: [
      {
        heading: 'It reads the page as rendered.',
        body: 'Computed styles, not source. Contrast is measured against what the pixel actually is after cascade, theme and inherited opacity — which is where most reported ratios quietly disagree with reality.',
      },
      {
        heading: 'It marks, then explains.',
        body: 'Each finding is placed on the element itself and restated in the side panel with the rule it violates, the measured value, and the threshold it missed. No score, no grade, no letter.',
      },
      {
        heading: 'It proposes, it does not commit.',
        body: 'Suggested fixes appear as a diff you read before anything changes. The nearest passing colour, the missing label, the role that contradicts the element. You decide whether it is right.',
      },
      {
        heading: 'It never leaves the machine.',
        body: 'Detection and suggestion both run in the extension. There is no account, no telemetry, and no request off the device — which is also why it works on staging behind a VPN.',
      },
    ],
    media: [
      {
        kind: 'video',
        src: '/media/accessibility-auto-fixer/overlay-markers.mp4',
        poster: '/media/accessibility-auto-fixer/overlay-markers.avif',
        alt: 'Screen recording: contrast failures are marked in place on a live page as the scan runs.',
        caption: 'Overlay markers, placed on the failing elements as the scan runs.',
        ratio: '16 / 9',
        placeholder: true,
      },
      {
        kind: 'image',
        src: '/media/accessibility-auto-fixer/side-panel.avif',
        alt: 'The side panel listing each finding with its rule, measured contrast ratio and required threshold.',
        caption: 'The side panel. Rule, measured value, required threshold — in that order.',
        ratio: '16 / 10',
        placeholder: true,
      },
      {
        kind: 'video',
        src: '/media/accessibility-auto-fixer/diff-view.mp4',
        poster: '/media/accessibility-auto-fixer/diff-view.avif',
        alt: 'Screen recording: the proposed colour change shown as a diff, then applied to the page preview.',
        caption: 'Every suggestion is a diff first. Nothing is applied until you say so.',
        ratio: '16 / 9',
        placeholder: true,
      },
    ],
    transparency: {
      automatic: [
        'Text and non-text contrast against WCAG 2.2 AA and AAA thresholds, measured on computed styles.',
        'Missing or empty accessible names on interactive elements.',
        'ARIA roles that contradict the element they are placed on, and required attributes that are absent.',
        'Focus order breaks caused by positive tabindex values.',
      ],
      manual: [
        'Whether alternative text is accurate, rather than merely present.',
        'Whether heading structure reflects the actual document outline.',
        'Whether a custom widget behaves the way its role promises under a real screen reader.',
        'Anything that depends on intent — an image is decorative or informative because of what it is for, not because of what it is.',
      ],
      locality:
        'Everything runs in the extension, on your machine. No page content, URL, screenshot or finding is transmitted anywhere. There is no account to create and no server to trust, which is deliberate: an accessibility tool that reads every page you visit has no business also being a network client.',
    },
    roadmap:
      'Currently in development. Next: exportable findings as a diffable artefact, so a fix can be reviewed in a pull request rather than in a browser. After that, shared rule configuration so a team audits against one agreed threshold.',
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/vantradesign' },
      { label: 'Report an issue', href: 'https://github.com/vantradesign' },
    ],
  },
  {
    slug: 'ai-design-reviewer',
    name: 'AI Design Reviewer',
    index: '02',
    accent: 'blue',
    coverLine: 'A second reader for the decisions nobody wrote down.',
    summary:
      'Reviews a component against the design system it claims to belong to, and reports where it has drifted.',
    status: 'planned',
    license: 'AGPL-3.0',
    mood: {
      src: '/editorial/02-design-reviewer-studio.avif',
      alt: 'A studio desk in low daylight with a display showing a component diff, two variants of the same button side by side.',
      focal: '50% 45%',
      placeholder: true,
    },
    problem:
      'A design system decays one reasonable exception at a time. Nobody notices the fourteenth hard-coded hex value, because each one was justified on the day it was written.',
    howItWorks: [
      {
        heading: 'It compares against your tokens, not a generic rulebook.',
        body: 'The review is grounded in the token schema and component graph parsed from your own repository, so drift is measured against what your system actually declares.',
      },
    ],
    media: [],
    transparency: {
      automatic: [],
      manual: [],
      locality:
        'Scope and locality guarantees will be published with the first release. Parsing is local by design; any model-backed review step will be opt-in and clearly marked.',
    },
    roadmap: 'Planned. Built on @vantra-design/core.',
    links: [{ label: 'Follow on GitHub', href: 'https://github.com/vantradesign' }],
  },
  {
    slug: 'deprecation-lifecycle-orchestrator',
    name: 'Deprecation Lifecycle Orchestrator',
    index: '03',
    accent: 'blue',
    coverLine: 'Removing something is also a design decision.',
    summary:
      'Tracks a deprecation from announcement to removal, and tells you who still depends on it.',
    status: 'planned',
    license: 'AGPL-3.0',
    mood: {
      src: '/editorial/03-deprecation-studio.avif',
      alt: 'A folded print-out on linen beside a screen showing a dependency graph with one node marked for removal.',
      focal: '50% 50%',
      placeholder: true,
    },
    problem:
      'Deprecation warnings are written once and then live forever, because nobody can prove the last consumer is gone.',
    howItWorks: [
      {
        heading: 'It answers the only question that matters.',
        body: 'Who breaks if this is removed today — read from the component graph, not from memory.',
      },
    ],
    media: [],
    transparency: {
      automatic: [],
      manual: [],
      locality: 'Analysis runs against your repository. Details to follow with the first release.',
    },
    roadmap: 'Planned. Part of the Vantra governance suite.',
    links: [{ label: 'Follow on GitHub', href: 'https://github.com/vantradesign' }],
  },
  {
    slug: 'ask-design-system',
    name: 'Ask Design System',
    index: '04',
    accent: 'cyan',
    coverLine: 'A conversation with your own tokens, on your own machine.',
    summary:
      'A local-first AI assistant that answers natural-language questions about your design tokens — with optional voice input and output — entirely in the browser.',
    status: 'in-development',
    license: 'Apache-2.0',
    mood: {
      src: '/editorial/04-ask-design-system-studio.avif',
      alt: 'A laptop on a desk showing the Ask Design System chat interface answering a question about spacing tokens.',
      focal: '50% 45%',
      placeholder: true,
    },
    problem:
      'Design system documentation gets outdated the day it is published. Token files are comprehensive but not searchable in natural language. Cloud-based design system tools — Zeroheight, Supernova, Specify — require accounts and send your data to third-party servers. Solo designers, small teams, and privacy-conscious organisations have no equivalent: they either answer every question manually or accept that knowledge stays trapped in files nobody reads.',
    howItWorks: [
      {
        heading: 'It reads your tokens, not a generic rulebook.',
        body: 'Pass your design token JSON — DTCG, Style Dictionary, or plain nested format — and the assistant indexes it on load. Every answer is grounded in your actual data, not a generic set of best practices.',
      },
      {
        heading: 'It retrieves before it reasons.',
        body: 'Each question is embedded and compared against your token chunks by cosine similarity. The top five matches are injected into the language model\u2019s context, so answers cite your tokens by name instead of inventing plausible ones.',
      },
      {
        heading: 'It speaks and listens, if you want it to.',
        body: 'Voice input transcribes speech into the text field via the Web Speech API. Voice output reads answers aloud through Kokoro TTS. Both are opt-in, and neither requires a network call after the initial model download.',
      },
      {
        heading: 'It never leaves the machine.',
        body: 'The language model, the embedding model and the TTS model all run in your browser via WebGPU. Your token data is processed in memory and never transmitted. There is no account, no telemetry, and no server to trust.',
      },
    ],
    media: [
      {
        kind: 'video',
        src: '/media/ask-design-system/chat-session.mp4',
        poster: '/media/ask-design-system/chat-session.avif',
        alt: 'Screen recording: a question about spacing tokens answered with a streamed response citing token names.',
        caption: 'A question about spacing, answered from your own token file.',
        ratio: '16 / 9',
        placeholder: true,
      },
      {
        kind: 'image',
        src: '/media/ask-design-system/model-loading.avif',
        alt: 'The model loading screen showing a progress bar at 72 percent with the note that the download is one-time only.',
        caption: 'The language model downloads once. After that, it loads in under three seconds.',
        ratio: '16 / 10',
        placeholder: true,
      },
    ],
    transparency: {
      automatic: [
        'Retrieval-augmented answers grounded in the token data you provided, with the top five matching chunks injected as context.',
        'Auto-detection of token format — DTCG, Style Dictionary, or plain nested JSON — with no manual configuration.',
        'Suggested starter questions derived from the token categories present in your schema.',
      ],
      manual: [
        'Whether an answer is correct. The model is small and quantized; it can misread a token name or invent a relationship that does not exist in the data.',
        'Whether a token value is current. The assistant sees the JSON you passed at initialisation, not a live feed from your repository.',
        'Whether the token structure is complete. If a category is missing from your JSON, the assistant cannot answer questions about it.',
      ],
      locality:
        'Everything runs in your browser. The only network request is the one-time model download from Hugging Face (~500 MB for the LLM, ~23 MB for the embedding model, ~82 MB for TTS). After that, there is no fetch call — enforceable via Content Security Policy. There is no account, no analytics, and no error reporting to any external service.',
    },
    roadmap:
      'Core and Vue packages in development. The headless class is functional; the Vue component is complete with chat, voice, and model-loading UI. Next: published npm packages and a hosted demo for embedding on this site.',
    links: [
      {
        label: 'Source on GitHub',
        href: 'https://github.com/vantradesign/vantra-ask-design-system',
      },
      {
        label: 'npm (core)',
        href: 'https://www.npmjs.com/package/@vantra-design/ask-design-system',
      },
      {
        label: 'npm (Vue)',
        href: 'https://www.npmjs.com/package/@vantra-design/ask-design-system-vue',
      },
    ],
  },
  {
    slug: 'design-system-maturity-check',
    name: 'Design System Maturity Check',
    index: '05',
    accent: 'cyan',
    coverLine: 'A level is worthless without the three things to do on Monday.',
    summary:
      'A 24-question self-assessment that scores a design system across documentation, versioning, governance and adoption, and returns level-appropriate next steps for each.',
    status: 'in-development',
    license: 'MIT',
    mood: {
      src: '/editorial/04-maturity-check-studio.avif',
      alt: 'A terminal on a plaster worktop showing the Maturity Check report: four dimension scores beside their next steps.',
      focal: '50% 45%',
      placeholder: true,
    },
    problem:
      'Most maturity models are a slide with five columns and no instructions. They tell a team it is level 2 and leave it there, which is the least useful half of the exercise: the gap was never the diagnosis, it was knowing which three things to change before the next quarter. Worse, the advice that does exist is written for a system that already has a design council and a token pipeline — level-5 answers handed to a team that still has no changelog.',
    howItWorks: [
      {
        heading: 'The score exists to select the advice.',
        body: 'Every level in every dimension carries three concrete, effort-tagged next steps written for a team at exactly that level. A level-2 team is never handed level-5 advice, because the number is a lookup key, not a verdict.',
      },
      {
        heading: 'Four dimensions, one question each.',
        body: 'Documentation: can a new team use a component without asking anyone? Versioning: can you ship a breaking change without breaking trust? Governance: who decides, how fast, and is that written down? Adoption: do teams actually use it, and do you know?',
      },
      {
        heading: 'The arithmetic is deliberately boring.',
        body: 'Answers are worth one to five points, questions carry a weight of one to three, and a category score is the weighted mean of the questions that were answered. The overall score is the unweighted mean of the four categories, so no dimension wins by having more questions. An honest “I don’t know” is skipped, never counted as zero.',
      },
      {
        heading: 'The export is the database.',
        body: 'There is no account and no server, so a JSON export is the persistence layer. Re-import last quarter’s file and the report renders the delta. Free-text notes stay in the local export and are never encoded into a share link.',
      },
      {
        heading: 'The catalog is data, not code.',
        body: 'Questions, weights and next steps are plain JSON validated against a published schema. The same engine can assess API governance or content operations by swapping the catalog — which is also how a team replaces our wording with their own.',
      },
    ],
    media: [
      {
        kind: 'video',
        src: '/media/design-system-maturity-check/interactive-run.mp4',
        poster: '/media/design-system-maturity-check/interactive-run.avif',
        alt: 'Screen recording: the terminal assessment being answered question by question, with the help text expanded on one of them.',
        caption: 'The interactive run. Twenty-four questions, keyboard only, roughly ten minutes.',
        ratio: '16 / 9',
        placeholder: true,
      },
      {
        kind: 'image',
        src: '/media/design-system-maturity-check/report.avif',
        alt: 'The rendered report: four dimension scores with their level names, each followed by three effort-tagged next steps.',
        caption: 'The report. Four scores, and twelve things to do — sorted by effort, not by severity.',
        ratio: '16 / 10',
        placeholder: true,
      },
      {
        kind: 'image',
        src: '/media/design-system-maturity-check/comparison.avif',
        alt: 'A second run compared against an earlier JSON export, showing the change in each dimension.',
        caption: 'A quarter later, compared against the earlier export. No database was involved.',
        ratio: '16 / 10',
        placeholder: true,
      },
    ],
    transparency: {
      automatic: [
        'A weighted score per dimension, and an overall score that weights each dimension equally.',
        'A level band from 1 (Ad hoc) to 5 (Optimising), with the threshold that produced it stated in the report.',
        'Three next steps per dimension, selected for the level reached and tagged with the effort they take.',
        'The delta against an earlier JSON export, dimension by dimension.',
      ],
      manual: [
        'Whether the answers are honest. This is a self-assessment; nothing reads your repository to check.',
        'Whether a practice that exists on paper is actually followed by the teams using the system.',
        'Whether a low score matters here. A two-person team with one product may be right to stay at level 2.',
        'Which of the three next steps is politically possible this quarter.',
      ],
      locality:
        'Everything runs in your terminal. No account, no telemetry, no network call — the questions ship with the binary and the report is rendered locally. The only thing that ever leaves is a file you exported on purpose.',
    },
    roadmap:
      'CLI in development, first release pending. Next: a static web version running the same engine, so a workshop can answer it on a screen instead of a laptop. After that, published reference catalogs beyond design systems.',
    links: [
      {
        label: 'Source on GitHub',
        href: 'https://github.com/vantradesign/vantra-maturity-check',
      },
      {
        label: 'Catalog authoring guide',
        href: 'https://github.com/vantradesign/vantra-maturity-check/blob/main/CONTRIBUTING.md',
      },
    ],
  },
  {
    slug: 'screenreader-empathy',
    name: 'Screenreader Empathy',
    index: '06',
    accent: 'blue',
    coverLine: 'Hear what your page sounds like to a screen reader.',
    summary:
      'A local-first empathy tool that walks the reading order of your HTML, plays it back aloud node by node, and flags what is confusing — deterministically, with optional AI commentary.',
    status: 'in-development',
    license: 'Apache-2.0',
    mood: {
      src: '/editorial/06-screenreader-empathy-studio.avif',
      alt: 'A laptop showing the Screenreader Empathy transcript panel with highlighted elements and deterministic flags beside a rendered page.',
      focal: '50% 40%',
      placeholder: true,
    },
    problem:
      'Sighted developers and designers rarely experience their work the way a screen reader user does. Compliance scanners produce rule violations as a checklist, but they do not convey what it feels like to navigate a page blind. A missing alt attribute is a line item, not a three-second silence where an image should have been described. Actual screen readers are authoritative but have steep learning curves — most designers trying VoiceOver for the first time give up before hearing a single word of their page.',
    howItWorks: [
      {
        heading: 'It walks the reading order, not the source.',
        body: 'The traversal follows the same sequence a screen reader would: DOM order, resolved roles, computed accessible names, landmark boundaries. The output is a numbered transcript, not a rule report.',
      },
      {
        heading: 'It speaks what it finds.',
        body: 'Each entry is read aloud the way a screen reader would announce it — role first, then name, with pauses where information is missing. An image without alt text is not a line item; it is a silence you hear.',
      },
      {
        heading: 'It flags without guessing.',
        body: 'Twelve deterministic flag types — missing accessible names, heading-level skips, generic link text, positive tabindex, and more — are detected by rules, not by a model. They are reproducible and will never hallucinate.',
      },
      {
        heading: 'It explains, if you ask.',
        body: 'Optional AI commentary describes what a screen reader user would experience at each flagged entry, in plain language. The commentary is clearly labelled, never blended with the deterministic data, and runs locally via WebGPU.',
      },
      {
        heading: 'It runs without a browser, too.',
        body: 'The headless core entry point has zero runtime dependencies and works with jsdom in Node or CI. No audio, no AI — just the traversal sequence and the flags, usable as a test assertion or a report.',
      },
    ],
    media: [
      {
        kind: 'video',
        src: '/media/screenreader-empathy/playback.mp4',
        poster: '/media/screenreader-empathy/playback.avif',
        alt: 'Screen recording: the page is read aloud node by node with the current element highlighted and the transcript scrolling alongside.',
        caption: 'Playback. Each element is highlighted as it is read, and the transcript follows.',
        ratio: '16 / 9',
        placeholder: true,
      },
      {
        kind: 'image',
        src: '/media/screenreader-empathy/transcript.avif',
        alt: 'The transcript panel showing a numbered reading order with deterministic flags marked on entries that have issues.',
        caption: 'The transcript. Flags are rule-based and reproducible — no model involved.',
        ratio: '16 / 10',
        placeholder: true,
      },
    ],
    transparency: {
      automatic: [
        'The full reading order sequence as a screen reader would traverse it, with computed accessible names and resolved roles.',
        'Twelve deterministic flag types applied by rules — missing names, heading skips, generic link text, duplicate IDs, and more.',
        'A page-level summary: landmark count, heading structure, and flag counts by type.',
      ],
      manual: [
        'Whether a missing accessible name matters. Some elements are intentionally unnamed; the tool flags them all.',
        'Whether the reading order is correct. The tool reports what a screen reader would do, not what it should do — those are different questions.',
        'Whether the AI commentary is accurate. It is generated by a small local model and may mischaracterise the user experience at a flagged entry.',
      ],
      locality:
        'The deterministic core runs entirely in memory with zero network calls — in the browser or in Node. The browser layer downloads a TTS model (~82 MB) and optionally an LLM (~500 MB) from Hugging Face on first use; both are cached locally. After that, there is no fetch call. There is no account, no analytics, and no telemetry.',
    },
    roadmap:
      'Core package in development with 122 passing tests. The headless analysis function and the TTS playback class are functional. Next: the Vue component for embedding, and a hosted demo for this site.',
    links: [
      {
        label: 'Source on GitHub',
        href: 'https://github.com/vantradesign/vantra-screenreader-empathy',
      },
      {
        label: 'npm (core + browser)',
        href: 'https://www.npmjs.com/package/@vantra-design/screenreader-empathy',
      },
    ],
  },
]

export function findProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}
