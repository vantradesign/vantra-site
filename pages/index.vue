<script setup lang="ts">
import { products } from '~/data/products'
import { tools } from '~/data/tools'
import { personNode, itemListNode } from '~/utils/schema'
import { absoluteUrl } from '~/utils/site'
import type { MoodImage } from '~/types/product'

/**
 * The home page carries the `Person` node for the operator and an `ItemList` of
 * the tools. It is the one page where naming the whole set is accurate rather
 * than padding: an engine that lands here should learn what exists in one pass.
 */
usePageSeo({
  title: 'Vantra',
  description:
    'Local-first, open-source tools for accessibility and design systems. Twenty free browser tools for contrast, type scales, fluid CSS, layout, governance and accessibility.',
  schema: [
    personNode(),
    itemListNode(
      absoluteUrl('/'),
      tools.map((tool) => ({
        name: tool.name,
        path: `/tools/${tool.slug}`,
        description: tool.summary,
      })),
    ),
  ],
})

const openingImage: MoodImage = {
  src: '/editorial/00-opening-spread.avif',
  alt: 'A studio interior in morning light: a laptop on a plaster worktop showing the Accessibility Auto-Fixer marking three contrast failures on a live page.',
  focal: '50% 45%',
  placeholder: true,
}

const manifesto = [
  'Vantra makes tools for the parts of a product nobody photographs — contrast ratios, deprecation notices, the accessible name of a button.',
  'They run on your machine, read your code, and send nothing anywhere.',
  'Open by default, because governance you cannot inspect is just an opinion.',
]

const principles = [
  'No cloud calls.',
  'Open by default.',
  'Built to be governed, not just used.',
  'A finding is worth nothing without the fix beside it.',
]
</script>

<template>
  <div>
    <FullBleedHero
      :image="openingImage"
      kicker="Vantra — Design system governance"
      cover-line="Built for the quiet parts of the interface."
      caption="Accessibility Auto-Fixer, running locally on a staging build. Three contrast failures, marked in place."
      priority
    />

    <ManifestoBlock kicker="What this is" :statements="manifesto" />

    <section aria-labelledby="work-heading" class="mt-section border-t border-rule bg-surface pb-16 md:pb-20">
      <h2 id="work-heading" class="gutter caption pt-8 md:pt-10">Work</h2>

      <div class="gutter mt-10 grid gap-10 sm:gap-8 md:grid-cols-[1fr_1.6fr_1fr] md:gap-6">
        <!-- Featured center card — first in DOM for mobile, placed center on desktop -->
        <WorkGridCard
          :product="products[0]"
          featured
          class="md:col-start-2 md:row-start-1 md:row-span-2"
        />
        <WorkGridCard
          :product="products[1]"
          class="md:col-start-1 md:row-start-1 md:self-start"
        />
        <WorkGridCard
          :product="products[2]"
          class="md:col-start-3 md:row-start-1 md:self-start"
        />
        <WorkGridCard
          :product="products[3]"
          class="md:col-start-1 md:row-start-2 md:self-start"
        />
        <WorkGridCard
          :product="products[4]"
          class="md:col-start-3 md:row-start-2 md:self-start"
        />
      </div>
    </section>

    <ToolShelf />

    <PullQuote kicker="Principles" :principles="principles" />

    <div class="gutter mt-section border-t border-rule pt-8 md:pt-10">
      <div class="md:grid md:grid-cols-12">
        <div class="md:col-span-8 md:col-start-5">
          <p class="font-display text-display text-balance measure-tight">
            Everything is on GitHub, including the parts that are not finished.
          </p>
          <p class="mt-8 flex flex-wrap gap-x-10 gap-y-3">
            <AppLink to="https://github.com/vantradesign" accent="blue">github.com/vantradesign</AppLink>
            <AppLink to="mailto:hello@vantra.design">hello@vantra.design</AppLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
