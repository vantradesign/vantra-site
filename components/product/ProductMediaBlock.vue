<script setup lang="ts">
import type { ProductMedia } from '~/types/product'

const props = withDefaults(
  defineProps<{
    media: ProductMedia
    /** The hero capture is eager; everything below the fold is lazy. */
    priority?: boolean
    full?: boolean
  }>(),
  { priority: false, full: false },
)

const prefersReducedMotion = useReducedMotion()
const video = ref<HTMLVideoElement | null>(null)

/**
 * Real product media is never decorative, so it is never hidden — but motion is
 * a preference. Under reduced motion the video renders as its poster frame with
 * native controls, so the visitor can still choose to play it.
 */
const autoplay = computed(() => props.media.kind === 'video' && !prefersReducedMotion.value)

watch(prefersReducedMotion, (reduced) => {
  const element = video.value
  if (!element) return
  if (reduced) element.pause()
  else void element.play().catch(() => {})
})
</script>

<template>
  <figure :class="full ? '' : 'gutter'">
    <div
      class="relative overflow-hidden bg-ink/5 ring-1 ring-rule"
      :style="{ aspectRatio: media.ratio }"
    >
      <!-- Unresolved capture. Reserves the real aspect ratio so adding the
           asset later cannot shift layout. -->
      <div
        v-if="media.placeholder"
        class="absolute inset-0 flex flex-col justify-end gap-2 p-6 bg-paper"
        role="img"
        :aria-label="media.alt"
      >
        <div class="absolute inset-3 border border-dashed border-ink/25" aria-hidden="true" />
        <p class="caption relative normal-case tracking-normal text-ink-muted">
          Awaiting real capture — {{ media.src }}
        </p>
        <p class="caption relative normal-case tracking-normal text-ink-faint max-w-[60ch]">
          {{ media.alt }}
        </p>
      </div>

      <video
        v-else-if="media.kind === 'video'"
        ref="video"
        :src="media.src"
        :poster="media.poster"
        :autoplay="autoplay"
        :controls="prefersReducedMotion"
        muted
        loop
        playsinline
        :preload="priority ? 'auto' : 'none'"
        :aria-label="media.alt"
        class="absolute inset-0 h-full w-full object-cover"
      />

      <NuxtImg
        v-else
        :src="media.src"
        :alt="media.alt"
        :sizes="full ? '100vw' : '100vw md:85vw'"
        :loading="priority ? 'eager' : 'lazy'"
        :preload="priority"
        class="absolute inset-0 h-full w-full object-cover"
      />
    </div>

    <figcaption :class="full ? 'gutter pt-4' : 'pt-4'">
      <EditorialCaption :text="media.caption" />
    </figcaption>
  </figure>
</template>
