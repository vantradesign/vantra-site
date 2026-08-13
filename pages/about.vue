<script setup lang="ts">
import { personNode } from '~/utils/schema'
import type { MoodImage } from '~/types/product'

/**
 * `AboutPage` plus the `Person` node. This URL is the `@id` target for that
 * person everywhere else in the graph, so the node belongs here as well as on the
 * home page — an engine resolving the reference should land on a page that is
 * about them.
 */
usePageSeo({
  title: 'About',
  description:
    'What Vantra is, and the principles the tools are built on: local-first, open by default, and a finding is worth nothing without the fix beside it.',
  pageType: 'AboutPage',
  breadcrumb: [{ name: 'About', path: '/about' }],
  schema: [personNode()],
})

const studio: MoodImage = {
  src: '/editorial/10-studio-detail.avif',
  alt: 'A desk detail in daylight: a display showing a design token file beside a folded print-out of a component inventory.',
  focal: '50% 50%',
  placeholder: true,
}

const principles = [
  'Local first, because a tool that reads every page you visit should not also be a network client.',
  'Open by default, because governance you cannot inspect is just an opinion.',
  'A finding is worth nothing without the fix beside it.',
  'Removing something is also a design decision.',
]
</script>

<template>
  <div>
    <section class="gutter pt-16 md:pt-24">
      <p class="caption">About</p>
      <h1 class="mt-8 font-display text-cover max-w-[22ch] text-balance">
        Design systems fail slowly, and always in the same places.
      </h1>
    </section>

    <EditorialSection
      kicker="The story"
      heading="It started as an audit nobody could act on."
      body="Vantra began with a component inventory of a system that had four buttons named Button. Every tool we tried could describe the problem and none could tell us who would break if we fixed it. So the first thing we built was not a linter — it was a parser that answers that one question, and every Vantra tool since has been built on top of it."
      :image="studio"
      caption="The token schema and the component inventory, side by side. Most drift is visible the moment you can read both at once."
      image-align="right"
    />

    <PullQuote kicker="Principles" :principles="principles" />

    <section class="gutter mt-section">
      <div class="md:grid md:grid-cols-12">
        <div class="md:col-span-8 md:col-start-5">
          <p class="font-display text-display text-balance measure-tight">
            Everything is on GitHub, including the parts that are not finished.
          </p>
          <p class="mt-8">
            <AppLink to="https://github.com/vantradesign" accent="blue">github.com/vantradesign</AppLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
