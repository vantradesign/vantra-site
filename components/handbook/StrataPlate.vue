<script setup lang="ts">
/**
 * The visual moment for chapter one: a typographic composition, not a diagram.
 * Three strata, read top to bottom, the way the system is actually stacked.
 */
const strata = [
  { label: 'You see', title: 'Tools', body: 'Extensions, CLIs, a dashboard. The surfaces you open.' },
  { label: 'They share', title: 'The core', body: 'One parser. One token schema. One component graph.' },
  { label: 'It reads', title: 'Your repository', body: 'Your files, on your machine, unmodified until you say so.' },
]

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <figure ref="root" class="mt-16 bg-ink py-16 md:py-20">
    <div class="gutter">
      <ol>
        <li
          v-for="(stratum, i) in strata"
          :key="stratum.title"
          class="border-t border-paper/15 py-8 md:grid md:grid-cols-12 md:items-baseline md:gap-x-8"
          :class="{ 'border-b': i === strata.length - 1 }"
        >
          <span class="caption text-paper/60 md:col-span-2">{{ stratum.label }}</span>

          <span class="mt-3 block font-display text-title text-paper md:col-span-4 md:mt-0">
            {{ stratum.title }}
          </span>

          <span class="mt-2 block measure text-paper/70 md:col-span-6 md:mt-0">
            {{ stratum.body }}
          </span>
        </li>
      </ol>
    </div>

    <figcaption class="gutter pt-6">
      <p class="caption text-paper/60 normal-case tracking-normal">
        The whole architecture on one page. Nothing above the top line, nothing below the bottom one.
      </p>
    </figcaption>
  </figure>
</template>
