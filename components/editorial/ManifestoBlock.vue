<script setup lang="ts">
defineProps<{
  statements: string[]
  kicker?: string
}>()
</script>

<template>
  <section class="gutter mt-section">
    <div class="md:grid md:grid-cols-12">
      <p v-if="kicker" class="caption md:col-span-2 mb-6 md:mb-0 md:pt-3">{{ kicker }}</p>

      <!-- No fade-in reveal here: the scroll highlight is the entrance. -->
      <div class="md:col-span-9 md:col-start-4 space-y-8">
        <HighlightText
          v-for="statement in statements"
          :key="statement"
          :text="statement"
          class="font-display text-display measure text-balance"
        />
      </div>
    </div>
  </section>
</template>
