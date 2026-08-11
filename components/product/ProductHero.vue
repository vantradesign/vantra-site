<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{ product: Product }>()

const STATUS_LABEL: Record<Product['status'], string> = {
  available: 'Available',
  'in-development': 'In development',
  planned: 'Planned',
}

const statusLabel = computed(() => STATUS_LABEL[props.product.status])
const hero = computed(() => props.product.media[0])
</script>

<template>
  <section class="pt-16 md:pt-24">
    <div class="gutter">
      <p class="caption flex gap-4">
        <span class="text-ink-faint tabular-nums">{{ product.index }}</span>
        <span>{{ statusLabel }}</span>
        <span class="text-ink-faint">{{ product.license }}</span>
      </p>

      <h1 class="mt-8 font-display text-cover max-w-[20ch] text-balance">
        {{ product.name }}
      </h1>

      <p class="mt-8 text-lead measure text-ink-muted">{{ product.summary }}</p>
    </div>

    <!-- Real product media only. No AI-generated imagery on product pages. -->
    <div v-if="hero" class="mt-14 md:mt-20">
      <ProductMediaBlock :media="hero" priority full />
    </div>
  </section>
</template>
