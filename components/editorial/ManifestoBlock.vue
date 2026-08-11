<script setup lang="ts">
defineProps<{
  statements: string[]
  kicker?: string
}>()

const root = ref<HTMLElement | null>(null)
useScrollReveal(root)
</script>

<template>
  <section ref="root" class="gutter mt-section">
    <div class="md:grid md:grid-cols-12">
      <p v-if="kicker" class="caption md:col-span-2 mb-6 md:mb-0 md:pt-3">{{ kicker }}</p>

      <div class="md:col-span-9 md:col-start-4 space-y-8">
        <p
          v-for="statement in statements"
          :key="statement"
          class="font-display text-display measure text-balance"
        >
          {{ statement }}
        </p>
      </div>
    </div>
  </section>
</template>
