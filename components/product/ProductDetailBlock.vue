<script setup lang="ts">
defineProps<{
  kicker?: string
  entries: { heading: string; body: string }[]
}>()

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <section ref="root" class="gutter mt-section">
    <div class="md:grid md:grid-cols-12 md:gap-x-8">
      <h2 v-if="kicker" class="caption md:col-span-3 mb-10 md:mb-0">{{ kicker }}</h2>

      <div class="md:col-span-8 md:col-start-5 space-y-14">
        <div v-for="entry in entries" :key="entry.heading">
          <h3 class="font-display text-title text-balance measure-tight">{{ entry.heading }}</h3>
          <p class="mt-5 measure text-ink-muted">{{ entry.body }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
