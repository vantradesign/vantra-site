<script setup lang="ts">
import type { Product } from '~/types/product'

const props = withDefaults(
  defineProps<{
    product: Product
    /** Alternates the crop so consecutive entries do not read as a grid. */
    align?: 'left' | 'right'
    /**
     * Heading level. 3 under a section heading (home page), 2 when the entries
     * sit directly under a page title (/work). Keeps the outline valid.
     */
    level?: 2 | 3
  }>(),
  { level: 3 },
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
  <article ref="root" class="mt-section border-t border-rule pt-8 md:pt-10">
    <div class="gutter">
      <div class="md:grid md:grid-cols-12 md:gap-x-8">
        <div
          class="relative overflow-hidden aspect-4/5 sm:aspect-16/10"
          :class="align === 'right' ? 'md:col-span-8 md:col-start-5' : 'md:col-span-9'"
        >
          <MoodImage
            :image="product.mood"
            sizes="100vw md:75vw"
          />
        </div>

        <div
          class="mt-8 md:mt-10"
          :class="align === 'right' ? 'md:col-span-6 md:col-start-2' : 'md:col-span-6 md:col-start-5'"
        >
          <p class="caption mb-6 flex gap-4">
            <span class="text-ink-faint tabular-nums">{{ product.index }}</span>
            <span>{{ statusLabel }}</span>
          </p>

          <component
            :is="`h${props.level}`"
            class="font-display text-title text-balance measure-tight"
          >
            {{ product.coverLine }}
          </component>

          <p class="mt-5 measure text-ink-muted">{{ product.summary }}</p>

          <p class="mt-7">
            <AppLink :to="`/work/${product.slug}`" :accent="accentClass">
              {{ product.name }}
            </AppLink>
          </p>
        </div>
      </div>
    </div>
  </article>
</template>
