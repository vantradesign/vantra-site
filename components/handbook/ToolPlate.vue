<script setup lang="ts">
import { tools } from '~/data/tools'

/**
 * Chapter three's visual: the twenty browser tools set as one typographic plate,
 * grouped by discipline. Names and links only — the index at /tools carries the
 * summaries, and repeating them here would make this page a second index.
 */
const DISCIPLINE_ORDER = ['Colour', 'Type', 'Layout', 'Motion', 'Units', 'Assets', 'Content', 'Governance', 'Accessibility'] as const

const groups = computed(() =>
  DISCIPLINE_ORDER.map((discipline) => ({
    discipline,
    entries: tools.filter((tool) => tool.discipline === discipline),
  })).filter((group) => group.entries.length > 0),
)

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <figure ref="root" class="gutter mt-16">
    <div class="border-t border-ink">
      <div
        v-for="group in groups"
        :key="group.discipline"
        class="border-b border-rule py-8 md:grid md:grid-cols-12 md:items-baseline md:gap-x-8"
      >
        <p class="caption md:col-span-2">{{ group.discipline }}</p>

        <ul class="mt-4 flex flex-wrap gap-x-8 gap-y-3 md:col-span-10 md:mt-0">
          <li v-for="tool in group.entries" :key="tool.slug" class="flex items-baseline gap-3">
            <span class="caption tabular-nums text-ink-faint" aria-hidden="true">{{ tool.index }}</span>
            <span class="font-display text-title">
              <AppLink :to="`/tools/${tool.slug}`">{{ tool.name }}</AppLink>
            </span>
          </li>
        </ul>
      </div>
    </div>

    <figcaption class="pt-6">
      <EditorialCaption
        index="Fig. 03"
        text="The utility set, grouped by the decision it serves rather than by the technology behind it. Each one runs entirely in the browser."
      />
    </figcaption>
  </figure>
</template>
