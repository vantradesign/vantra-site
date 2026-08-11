<script setup lang="ts">
defineProps<{
  /** Small uppercase label above the panel. Omit for unlabelled regions. */
  label?: string
  /** One short line under the label. */
  note?: string
}>()
</script>

<template>
  <section class="border-t border-ink pt-6">
    <header v-if="label || note" class="mb-6">
      <h2 v-if="label" class="caption text-ink">{{ label }}</h2>
      <p v-if="note" class="mt-2 measure text-ink-muted">{{ note }}</p>
    </header>

    <slot />
  </section>
</template>
