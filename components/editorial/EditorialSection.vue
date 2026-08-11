<script setup lang="ts">
import type { MoodImage } from '~/types/product'

withDefaults(
  defineProps<{
    heading?: string
    kicker?: string
    body?: string
    image?: MoodImage
    caption?: string
    /** Image side. Text takes the other column. */
    imageAlign?: 'left' | 'right'
  }>(),
  { imageAlign: 'right' },
)

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <section ref="root" class="gutter mt-section">
    <div class="md:grid md:grid-cols-12 md:gap-x-8 md:items-start">
      <div
        class="order-2 md:order-none"
        :class="imageAlign === 'right' ? 'md:col-span-5' : 'md:col-span-5 md:col-start-8'"
      >
        <p v-if="kicker" class="caption mb-6">{{ kicker }}</p>
        <h2 v-if="heading" class="font-display text-title text-balance measure-tight">
          {{ heading }}
        </h2>
        <p v-if="body" class="mt-6 measure text-ink-muted">{{ body }}</p>
        <slot />
      </div>

      <figure
        v-if="image"
        class="mb-10 md:mb-0"
        :class="imageAlign === 'right' ? 'md:col-span-6 md:col-start-7' : 'md:col-span-6 md:row-start-1'"
      >
        <div class="relative overflow-hidden aspect-4/5">
          <MoodImage :image="image" sizes="100vw md:50vw" />
        </div>
        <figcaption v-if="caption" class="pt-4">
          <EditorialCaption :text="caption" />
        </figcaption>
      </figure>
    </div>
  </section>
</template>
