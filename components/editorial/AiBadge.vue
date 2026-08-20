<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Corner to anchor the badge. */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  }>(),
  { position: 'bottom-left' },
)
</script>

<template>
  <span
    class="absolute z-10 border border-rule bg-paper/80 px-2 py-1 caption backdrop-blur-sm normal-case tracking-normal pointer-events-none select-none"
    :class="{
      'top-3 left-3': position === 'top-left',
      'top-3 right-3': position === 'top-right',
      'bottom-3 left-3': position === 'bottom-left',
      'bottom-3 right-3': position === 'bottom-right',
    }"
    aria-hidden="true"
  >
    AI Generated
  </span>
</template>
