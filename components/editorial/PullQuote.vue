<script setup lang="ts">
defineProps<{
  principles: string[]
  kicker?: string
}>()

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <section ref="root" class="mt-section bg-cyan-soft/45 py-20 md:py-28">
    <div class="gutter">
      <h2 v-if="kicker" class="caption mb-12">{{ kicker }}</h2>

      <ul>
        <li
          v-for="(principle, i) in principles"
          :key="principle"
          class="border-t border-ink/15 py-8 md:py-10"
          :class="{ 'border-b': i === principles.length - 1 }"
        >
          <p class="font-display text-title measure-tight text-balance">{{ principle }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
