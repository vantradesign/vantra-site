<script setup lang="ts">
withDefaults(
  defineProps<{
    /** One sentence. If it needs two, it is not a pull-quote. */
    text: string
    attribution?: string
    /** Ink reverses the block for the loudest moments in a chapter. */
    tone?: 'paper' | 'ink'
  }>(),
  { tone: 'paper' },
)

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <figure
    ref="root"
    class="mt-16"
    :class="tone === 'ink' ? 'bg-ink py-20 md:py-24' : ''"
  >
    <div class="gutter">
      <div class="md:grid md:grid-cols-12 md:gap-x-8">
        <blockquote
          class="md:col-span-9 md:col-start-4"
          :class="tone === 'ink' ? '' : 'border-t border-ink pt-10'"
        >
          <p
            class="font-display text-display text-balance measure-tight"
            :class="tone === 'ink' ? 'text-paper' : ''"
          >
            {{ text }}
          </p>
        </blockquote>

        <figcaption
          v-if="attribution"
          class="caption mt-6 md:col-span-9 md:col-start-4"
          :class="tone === 'ink' ? 'text-paper/70' : ''"
        >
          {{ attribution }}
        </figcaption>
      </div>
    </div>
  </figure>
</template>
