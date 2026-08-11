<script setup lang="ts">
import type { MoodImage } from '~/types/product'

withDefaults(
  defineProps<{
    image: MoodImage
    coverLine: string
    kicker?: string
    caption?: string
    priority?: boolean
  }>(),
  { priority: false },
)
</script>

<template>
  <section class="relative">
    <div class="relative h-[78svh] min-h-[30rem] overflow-hidden">
      <MoodImage :image="image" :priority="priority" sizes="100vw" />

      <div
        class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/70 via-ink/25 to-transparent"
        aria-hidden="true"
      />

      <div class="absolute inset-x-0 bottom-0 gutter pb-12 md:pb-16">
        <p v-if="kicker" class="caption text-paper/70 mb-5">{{ kicker }}</p>
        <h1 class="font-display text-cover text-paper max-w-[22ch] text-balance">
          {{ coverLine }}
        </h1>
      </div>
    </div>

    <div v-if="caption" class="gutter pt-5">
      <EditorialCaption :text="caption" />
    </div>
  </section>
</template>
