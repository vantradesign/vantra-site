<script setup lang="ts">
import { tools } from '~/data/tools'

const props = defineProps<{ slug: string }>()

const position = computed(() => tools.findIndex((tool) => tool.slug === props.slug))
const previous = computed(() => (position.value > 0 ? tools[position.value - 1] : undefined))
const next = computed(() =>
  position.value >= 0 && position.value < tools.length - 1 ? tools[position.value + 1] : undefined,
)
</script>

<template>
  <nav aria-label="More tools" class="gutter mt-section border-t border-ink pt-8">
    <div class="grid gap-8 md:grid-cols-12 md:gap-x-8">
      <div v-if="previous" class="md:col-span-4">
        <p class="caption">Previous</p>
        <p class="mt-3 font-display text-title">
          <AppLink :to="`/tools/${previous.slug}`">{{ previous.name }}</AppLink>
        </p>
      </div>

      <div v-if="next" class="md:col-span-4 md:col-start-5">
        <p class="caption">Next</p>
        <p class="mt-3 font-display text-title">
          <AppLink :to="`/tools/${next.slug}`">{{ next.name }}</AppLink>
        </p>
      </div>

      <div class="md:col-span-3 md:col-start-10 md:text-right">
        <p class="caption">Index</p>
        <p class="mt-3">
          <AppLink to="/tools" accent="blue">All ten tools</AppLink>
        </p>
      </div>
    </div>
  </nav>
</template>
