<script setup lang="ts">
import { chapters } from '~/data/handbook'
import type { MoodImage } from '~/types/product'

usePageSeo({
  title: 'How it works',
  description:
    'How Vantra is put together: what @vantra-design/core parses, why every tool builds on it, and how governance, tools and contribution fit around it.',
  breadcrumb: [{ name: 'How it works', path: '/how-it-works' }],
})

/** Index-safe lookup: the register, the contents page and these sections share one source. */
const chapter = (id: string) => chapters.find((entry) => entry.id === id)!

const governanceImage: MoodImage = {
  src: '/editorial/20-governance-desk.avif',
  alt: 'A desk in daylight: a screen showing a deprecation timeline with one component marked for removal, beside a printed list of its remaining consumers.',
  focal: '50% 50%',
  placeholder: true,
}

const install = `# the shared parser every Vantra tool reads through
npm i -D @vantra-design/core`

const usage = `import { parseTokenSchema, buildComponentGraph } from '@vantra-design/core'

const tokens = await parseTokenSchema('assets/css/main.css')
const graph = await buildComponentGraph('components')

// who breaks if this is removed today
graph.consumersOf('components/base/AppLink.vue')`
</script>

<template>
  <div>
    <ChapterRegister reveal-after="opening" />

    <section id="opening" class="gutter pt-16 md:pt-24">
      <p class="caption">How it works</p>
      <h1 class="mt-8 font-display text-cover max-w-[20ch] text-balance">
        How Vantra holds together.
      </h1>

      <div class="mt-12 md:grid md:grid-cols-12 md:gap-x-8">
        <p class="md:col-span-6 md:col-start-5 text-lead measure text-ink-muted">
          Five chapters on the shape of the system: what the core does, what the tools do with it,
          and why governance is treated as a craft rather than a process. Written to be read, not
          searched — but if you came for one answer, the contents below will take you to it.
        </p>
      </div>
    </section>

    <ChapterContents />

    <!-- 01 ------------------------------------------------------------------ -->
    <ChapterSection :chapter="chapter('what-vantra-is')">
      <template #standfirst>
        Vantra is not a platform and not a suite. It is a set of instruments that happen to agree
        with each other, because they all read your system the same way.
      </template>

      <ChapterProse
        kicker="The idea"
        :paragraphs="[
          'Most design system tooling arrives with its own idea of what your system is. One tool knows your colours but not your components, another knows your components but not who consumes them, and a third asks you to describe both again in a config file. The disagreements between them are where the work quietly goes.',
          'Vantra starts from the opposite end. One library reads the repository — tokens, components, the edges between them — and everything else is a surface over that reading. A contrast checker, a design reviewer, a deprecation tracker: different questions, one shared answer about what exists.',
          'The second decision is locality. Everything runs on your machine. The tools read files and rendered pages, which is exactly the kind of access that should never be paired with a network client. No account, no upload, no telemetry — which is also why they work on staging behind a VPN, and why the licences are open.',
        ]"
      >
        <p class="measure text-ink-muted">
          Where this came from, and the principles it is held to, are on
          <AppLink to="/about" accent="blue">the about page</AppLink>.
        </p>
      </ChapterProse>

      <StrataPlate />

      <PullSentence
        text="A tool that cannot name what already exists in your system is guessing politely."
      />
    </ChapterSection>

    <!-- 02 ------------------------------------------------------------------ -->
    <ChapterSection :chapter="chapter('the-core')">
      <template #standfirst>
        @vantra-design/core is the parser. It answers two questions — what does this system declare,
        and who depends on it — and every other tool is built on those answers.
      </template>

      <ChapterProse
        kicker="What it does"
        :paragraphs="[
          'The core reads two things out of a repository. First, the token schema: the colours, spacing steps and type sizes a system actually declares, taken from CSS custom properties rather than from a separate manifest that drifts from the stylesheet. Second, the component graph: which component imports which, and therefore which consumers exist for any given file.',
          'That second answer is the reason the library exists. It is easy to report that a button has four variants and hard to say who breaks if three of them are removed. The graph turns that from a memory exercise into a lookup, and it is what the Design Reviewer, the Deprecation Orchestrator and the Governance Suite all share — they ask different questions of the same graph rather than each building their own.',
          'You install it as a dev dependency. It has no runtime and ships nothing to your users; it is a build-time and CLI-time library that reads your source and returns structured data. Nothing is written back unless a tool you invoked asks to write it.',
        ]"
      />

      <div class="gutter mt-12">
        <div class="md:grid md:grid-cols-12 md:gap-x-8">
          <div class="space-y-8 md:col-span-6 md:col-start-4">
            <CodeCallout
              label="Install"
              :code="install"
              note="A dev dependency. There is no runtime bundle and nothing to configure before the first run."
            />

            <CodeCallout
              label="The two answers, in code"
              :code="usage"
              note="parseTokenSchema reads the declarations; buildComponentGraph reads the edges. Everything else in Vantra is a question asked of one of these two."
            />

            <p class="measure text-ink-muted">
              This page is the invitation, not the specification. The full API, the caveats and the
              tests live in
              <AppLink to="https://github.com/vantradesign" accent="blue">the core repository</AppLink>.
            </p>
          </div>
        </div>
      </div>

      <CoreDiagram />

      <PullSentence
        tone="ink"
        text="Parse once, then argue about the results — not about the parsing."
      />
    </ChapterSection>

    <!-- 03 ------------------------------------------------------------------ -->
    <ChapterSection :chapter="chapter('the-tools')">
      <template #standfirst>
        Two families, and an easy way to tell them apart: the utilities answer a question in seconds,
        the products watch a system over time.
      </template>

      <ChapterProse
        kicker="Which one you need"
        :paragraphs="[
          'The twenty browser tools start at the small end. Contrast ratios, modular type scales, easing curves, clamp() values, grid and flex layouts, colour ramps, breakpoints, focus rings — the unglamorous arithmetic behind a design system, done properly and done in the browser. They need no install and no repository: you open one, get a value, copy it, and close the tab. Nothing is uploaded because there is nowhere for it to go.',
          'The products are the long end. The Accessibility Auto-Fixer reads a rendered page and proposes fixes as diffs you approve. The AI Design Reviewer compares a component against the system it claims to belong to. Screenreader Empathy walks the reading order of your HTML and plays it back aloud, flagging what is confusing. Most of these read your repository through the core, which is why their findings cite your tokens instead of a generic rulebook.',
          'The Design System Maturity Check is the exception, and deliberately so. It reads nothing: it asks twenty-four questions, scores four dimensions, and returns three next steps written for the level you actually reached. Some things about a system are not in the source — who decides, how fast, and whether anyone wrote it down — and a tool that pretends to measure them from a repository would be guessing.',
          'The rule of thumb: if the question is arithmetic, use a utility. If the question is whether your system still means what it says, use a product.',
        ]"
      >
        <p class="measure text-ink-muted">
          The full set is at <AppLink to="/tools" accent="blue">/tools</AppLink>, and each product has
          its own page under <AppLink to="/work" accent="blue">work</AppLink>.
        </p>
      </ChapterProse>

      <ToolPlate />
    </ChapterSection>

    <!-- 04 ------------------------------------------------------------------ -->
    <ChapterSection :chapter="chapter('governance')">
      <template #standfirst>
        Deprecation, versioning and ownership are not paperwork. They are the parts of the craft that
        only show up years later, which is exactly why they get skipped.
      </template>

      <ChapterProse
        kicker="The posture"
        :paragraphs="[
          'A design system decays one reasonable exception at a time. Nobody notices the fourteenth hard-coded hex value, because each one was justified on the day it was written. The same is true of the deprecation notice nobody can retire, and the component with no owner that four teams depend on. None of these are failures of discipline; they are failures of visibility.',
          'Governance, in Vantra, means making those things visible enough to act on. A deprecation has a date, a replacement and a list of remaining consumers read from the graph — not a comment that says do not use this. A breaking change is described by what it breaks. Ownership is a fact in the repository rather than folklore in a channel.',
          'The Governance Suite is where this lives: a health CLI, a breaking-change analyser and a deprecation orchestrator, sharing the core inventory so that all three agree on what your system contains. It reports, it does not enforce. A tool that silently rewrites your system to satisfy its own policy has confused governance with control.',
        ]"
      />

      <EditorialSection
        kicker="In practice"
        heading="Removing something is also a design decision."
        body="The orchestrator treats a removal the way a release is treated: announced, dated, tracked, and closed only when the last consumer is gone. The list of consumers comes from the component graph, so it is a fact rather than an estimate — and it shrinks in public, where everyone can see the deprecation actually ending."
        :image="governanceImage"
        caption="A deprecation timeline beside its remaining consumers. The notice can only be retired when the list is empty."
        image-align="right"
      />

      <PullSentence
        text="Governance you cannot inspect is just an opinion with a process around it."
      />
    </ChapterSection>

    <!-- 05 ------------------------------------------------------------------ -->
    <ChapterSection :chapter="chapter('taking-part')">
      <template #standfirst>
        Everything is on GitHub, including the parts that are not finished. That is deliberate, and it
        is where help is most useful.
      </template>

      <ChapterProse
        kicker="How to help"
        :paragraphs="[
          'Several of these tools are in development and one or two are still planned. The repositories are public at that stage on purpose: a governance tool that appears fully formed, with no visible history of its own decisions, is asking for a kind of trust it has not earned.',
          'The most useful contribution is rarely a pull request. It is a repository that breaks the parser in a way we had not considered — a token file with a naming convention we did not anticipate, a component graph with a cycle in it, a page whose computed contrast disagrees with every checker. Those cases become fixtures, and fixtures are what keep the core honest.',
          'After that: issues written from real use, documentation that corrects what this page simplifies, and reviews of the accessibility work itself. If you would rather just watch, the repositories are readable without an account.',
        ]"
      >
        <p class="measure text-ink-muted">
          Contribution guidelines sit next to the source at
          <AppLink to="https://github.com/vantradesign" accent="blue">github.com/vantradesign</AppLink>,
          or write to
          <AppLink to="mailto:hello@vantra.design">hello@vantra.design</AppLink>.
        </p>
      </ChapterProse>

      <PullSentence
        tone="ink"
        text="Published unfinished, because a tool about accountability should be accountable first."
      />
    </ChapterSection>
  </div>
</template>
