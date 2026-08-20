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
  <div class="relative">
    <div class="relative h-[85svh] min-h-[30rem] overflow-hidden">
      <MoodImage :image="image" :priority="priority" sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw 3xl:100vw 4xl:100vw" />

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
  </div>
</template>
