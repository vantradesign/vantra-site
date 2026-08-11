<script setup lang="ts">
/**
 * Splits a statement into words so each one can be highlighted on its own
 * slice of the block's scroll progress.
 *
 * The words carry their index and the total count as custom properties; all
 * timing lives in CSS (`.highlight-scroll` in main.css). Nothing here listens
 * to scroll, so there is no JS on the critical path and nothing to hydrate.
 */
const props = defineProps<{ text: string }>()

const words = computed(() => props.text.split(/\s+/).filter(Boolean))
</script>

<template>
  <p class="highlight-scroll" :style="{ '--word-count': words.length }">
    <span
      v-for="(word, index) in words"
      :key="`${index}-${word}`"
      :style="{ '--word-index': index }"
      >{{ word }}{{ ' ' }}</span
    >
  </p>
</template>
