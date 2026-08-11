<script setup lang="ts">
withDefaults(
  defineProps<{
    code: string
    label?: string
    copyLabel?: string
    message?: string
  }>(),
  { label: 'Copy-ready', copyLabel: 'Copy CSS' },
)
</script>

<template>
  <figure class="border-t border-ink pt-4">
    <div class="flex items-start justify-between gap-4">
      <figcaption class="caption pt-3">{{ label }}</figcaption>
      <CopyButton :value="code" :label="copyLabel" :message="message" />
    </div>

    <pre
      class="mt-3 overflow-x-auto py-2 font-mono text-[0.875rem] leading-relaxed text-ink"
      tabindex="0"
    ><code>{{ code }}</code></pre>
  </figure>
</template>
