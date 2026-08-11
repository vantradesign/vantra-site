<script setup lang="ts">
defineProps<{
  index?: string
  text: string
}>()
</script>

<template>
  <p class="caption flex gap-4">
    <span v-if="index" class="text-ink-faint tabular-nums">{{ index }}</span>
    <span class="max-w-[52ch] normal-case tracking-normal text-[0.9375rem] leading-relaxed">
      {{ text }}
    </span>
  </p>
</template>
