<script setup lang="ts">
import { products } from '~/data/products'

useSeoMeta({
  title: 'Work',
  description:
    'Vantra’s tools: an accessibility auto-fixer, a design reviewer, and a deprecation lifecycle orchestrator.',
})
</script>

<template>
  <div>
    <section class="gutter pt-16 md:pt-24">
      <p class="caption">Work</p>
      <h1 class="mt-8 font-display text-cover max-w-[24ch] text-balance">
        Three tools, one question: what is this system actually doing?
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
