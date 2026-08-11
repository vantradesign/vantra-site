<script setup lang="ts">
withDefaults(
  defineProps<{
    code: string
    /** What the snippet is, in words. Sits where a filename would in a docs theme. */
    label: string
    /** One editorial line under the block. Explains the snippet, never repeats it. */
    note?: string
    copyLabel?: string
  }>(),
  { copyLabel: 'Copy' },
)
</script>

<template>
  <!-- A code block in the site's own palette: thin ink rule, cyan wash, no
       syntax theme. Snippets here are short enough that colouring tokens would
       add decoration, not comprehension. -->
  <figure class="border border-ink/20 bg-cyan-soft/25">
    <div class="flex items-start justify-between gap-4 border-b border-ink/12 px-5 py-3">
      <figcaption class="caption pt-2">{{ label }}</figcaption>
      <CopyButton :value="code" :label="copyLabel" :message="`Copied — ${label.toLowerCase()}`" />
    </div>

    <pre
      class="overflow-x-auto px-5 py-5 font-mono text-[0.8125rem] leading-relaxed text-ink"
      tabindex="0"
    ><code>{{ code }}</code></pre>

    <p v-if="note" class="border-t border-ink/12 px-5 py-4 text-[0.9375rem] leading-relaxed text-ink-muted">
      {{ note }}
    </p>
  </figure>
</template>
