<script setup lang="ts">
import type { Chapter } from '~/data/handbook'

defineProps<{ chapter: Chapter }>()

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <!-- scroll-mt clears the running head when the anchor is jumped to, by
       keyboard or by link. -->
  <section
    :id="chapter.id"
    ref="root"
    :aria-labelledby="`${chapter.id}-heading`"
    class="mt-section scroll-mt-28"
  >
    <div class="gutter">
      <div class="md:grid md:grid-cols-12 md:gap-x-8">
        <p class="caption tabular-nums md:col-span-2">Chapter {{ chapter.index }}</p>

        <div class="mt-6 md:col-span-9 md:col-start-4 md:mt-0">
          <h2 :id="`${chapter.id}-heading`" class="font-display text-display text-balance measure-tight">
            {{ chapter.title }}
          </h2>
          <p class="mt-6 text-lead measure text-ink-muted">
            <slot name="standfirst" />
          </p>
        </div>
      </div>
    </div>

    <slot />
  </section>
</template>
