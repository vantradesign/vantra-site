<script setup lang="ts">
import type { Product } from '~/types/product'

const props = withDefaults(
  defineProps<{
    product: Product
    /** Makes the card taller with a larger title for the center position. */
    featured?: boolean
    /**
     * Heading level. 3 under a section heading (home page), 2 when the entries
     * sit directly under a page title. Keeps the outline valid.
     */
    level?: 2 | 3
  }>(),
  { featured: false, level: 3 },
)

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)

const STATUS_LABEL: Record<Product['status'], string> = {
  available: 'Available',
  'in-development': 'In development',
  planned: 'Planned',
}

const statusLabel = computed(() => STATUS_LABEL[props.product.status])
const accentClass = computed(() => (props.product.accent === 'cyan' ? 'cyan' : 'blue'))
</script>

<template>
  <article ref="root" class="flex flex-col">
    <NuxtLink
      :to="`/work/${product.slug}`"
      class="relative block overflow-hidden"
      :class="featured ? 'aspect-[3/4]' : 'aspect-[4/5]'"
      tabindex="-1"
      aria-hidden="true"
    >
      <MoodImage
        :image="product.mood"
        :sizes="featured ? '(min-width: 768px) 45vw, 100vw' : '(min-width: 768px) 28vw, 100vw'"
      />
    </NuxtLink>

    <div class="mt-5 text-center">
      <p class="caption">{{ statusLabel }}</p>

      <component
        :is="`h${level}`"
        class="mt-2 font-display text-balance"
        :class="featured ? 'text-title' : 'text-body leading-snug tracking-[-0.01em]'"
      >
        {{ product.coverLine }}
      </component>

      <p class="mt-3 caption">
        <AppLink :to="`/work/${product.slug}`" :accent="accentClass">
          {{ product.name }}
        </AppLink>
      </p>
    </div>
  </article>
</template>
