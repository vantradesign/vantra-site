<script setup lang="ts">
import type { MoodImage } from '~/types/product'

const props = withDefaults(
  defineProps<{
    image: MoodImage
    /** Only the LCP image on a page should set this. */
    priority?: boolean
    sizes?: string
  }>(),
  { priority: false, sizes: '100vw' },
)
</script>

<template>
  <!-- Unresolved asset: a deliberately marked frame, never a fabricated image.
       Keeps layout and alt-text contract identical to the real asset. -->
  <div
    v-if="props.image.placeholder"
    class="absolute inset-0 bg-ink flex items-end"
    role="img"
    :aria-label="props.image.alt"
  >
    <div class="absolute inset-4 border border-dashed border-cyan/40" aria-hidden="true" />
    <p class="caption relative gutter pb-8 text-cyan-soft/80 max-w-[46ch] normal-case tracking-normal">
      AI editorial placeholder — {{ props.image.src }}
    </p>
  </div>

  <template v-else>
    <NuxtImg
      :src="props.image.src"
      :alt="props.image.alt"
      :sizes="props.sizes"
      :loading="props.priority ? 'eager' : 'lazy'"
      :preload="props.priority"
      :fetchpriority="props.priority ? 'high' : 'auto'"
      :style="{ objectPosition: props.image.focal ?? '50% 50%' }"
      class="absolute inset-0 h-full w-full object-cover"
    />
    <AiBadge />
  </template>
</template>
