<script setup lang="ts">
import { products } from '~/data/products'
import { itemListNode } from '~/utils/schema'
import { absoluteUrl } from '~/utils/site'

usePageSeo({
  title: 'Work',
  description:
    'Vantra’s products: an accessibility auto-fixer, a design reviewer, a screenreader empathy tool, a design system assistant, and a maturity check.',
  pageType: 'CollectionPage',
  breadcrumb: [{ name: 'Work', path: '/work' }],
  schema: [
    itemListNode(
      absoluteUrl('/work'),
      products.map((product) => ({
        name: product.name,
        path: `/work/${product.slug}`,
        description: product.summary,
      })),
    ),
  ],
})
</script>

<template>
  <div>
    <section class="gutter pt-16 md:pt-24">
      <p class="caption">Work</p>
      <h1 class="mt-8 font-display text-cover max-w-[24ch] text-balance">
        Five tools, one question: what is this system actually doing?
      </h1>
    </section>

    <WorkEntry
      v-for="(product, i) in products"
      :key="product.slug"
      :product="product"
      :align="i % 2 === 0 ? 'left' : 'right'"
      :level="2"
    />
  </div>
</template>
