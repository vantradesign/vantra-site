<script setup lang="ts">
import { products } from '~/data/products'
import type { MoodImage } from '~/types/product'

useSeoMeta({
  title: 'Vantra',
  description:
    'Vantra builds local-first, open-source tools for accessibility, design systems and product governance.',
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

    <section aria-labelledby="work-heading">
      <h2 id="work-heading" class="gutter caption mt-section">Work</h2>
      <WorkEntry
        v-for="(product, i) in products"
        :key="product.slug"
        :product="product"
        :align="i % 2 === 0 ? 'left' : 'right'"
      />
    </section>

    <PullQuote kicker="Principles" :principles="principles" />

    <section class="gutter mt-section">
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
    </section>
  </div>
</template>
