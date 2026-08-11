<script setup lang="ts">
/**
 * Splits a statement into words so each one can be highlighted on its own
 * slice of the surrounding block's scroll progress.
 *
 * `offset` is the number of words that come before this statement in the block
 * and `total` the word count of the whole block, so the sweep continues across
 * paragraphs instead of restarting on each one. The timeline itself is declared
 * by the parent (`.highlight-scroll`) and all timing lives in CSS. Nothing here
 * listens to scroll, so there is no JS on the critical path and nothing to
 * hydrate.
 */
const props = defineProps<{ text: string; offset: number; total: number }>()

const words = computed(() => props.text.split(/\s+/).filter(Boolean))
</script>

<template>
  <p>
    <span
      v-for="(word, index) in words"
      :key="`${index}-${word}`"
      class="highlight-word"
      :style="{ '--word-index': offset + index, '--word-count': total }"
      >{{ word }}{{ ' ' }}</span
    >
  </p>
</template>
