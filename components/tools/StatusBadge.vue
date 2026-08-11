<script setup lang="ts">
defineProps<{
  passes: boolean
  label: string
  /** Threshold or requirement, shown small under the label. */
  detail?: string
}>()
</script>

<template>
  <div class="border-t pt-3" :class="passes ? 'border-pass' : 'border-fail'">
    <p class="flex items-baseline gap-2">
      <span aria-hidden="true" :class="passes ? 'text-pass' : 'text-fail'">
        {{ passes ? '✓' : '✕' }}
      </span>
      <span class="caption font-bold" :class="passes ? 'text-pass' : 'text-fail'">
        {{ label }}
      </span>
    </p>
    <p class="mt-1 flex flex-col">
      <span class="caption normal-case tracking-normal" :class="passes ? 'text-pass' : 'text-fail'">
        {{ passes ? 'Pass' : 'Fail' }}
      </span>
      <span v-if="detail" class="caption mt-1 normal-case tracking-normal text-ink-muted">
        {{ detail }}
      </span>
    </p>
  </div>
</template>
