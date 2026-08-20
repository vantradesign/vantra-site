<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{ product: Product }>()

const STATUS_LABEL: Record<Product['status'], string> = {
  available: 'Available',
  'in-development': 'In development',
  planned: 'Planned',
}

const statusLabel = computed(() => STATUS_LABEL[props.product.status])
</script>

<template>
  <section>
    <!-- Editorial mood image as full-bleed hero -->
    <FullBleedHero
      :image="product.mood"
      :kicker="`${product.index} — ${statusLabel} · ${product.license}`"
      :cover-line="product.name"
      :caption="product.summary"
      priority
    />
  </section>
</template>
