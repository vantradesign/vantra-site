<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Text written to the clipboard. */
    value: string
    /** Visible button text. Hidden when variant is 'icon'. */
    label?: string
    /** Full accessible name, needed when the label is short or absent. */
    ariaLabel?: string
    /** Toast message on success. */
    message?: string
    variant?: 'solid' | 'quiet' | 'icon'
  }>(),
  { label: 'Copy', variant: 'quiet' },
)

const { copy, copied } = useCopyToClipboard()

const VARIANT_CLASS = {
  solid: 'border-ink bg-ink text-paper hover:bg-blue hover:border-blue',
  quiet: 'border-rule text-ink hover:border-ink',
  icon: 'border-rule text-ink hover:border-ink',
} as const

const classes = computed(() => VARIANT_CLASS[props.variant])
</script>

<template>
  <button
    type="button"
    class="caption inline-flex shrink-0 items-center justify-center gap-2 border normal-case tracking-normal transition-colors duration-200 ease-editorial"
    :class="[classes, variant === 'icon' ? 'size-11' : 'min-h-11 px-4 py-2']"
    :aria-label="ariaLabel"
    @click="copy(value, message ?? `Copied ${label.toLowerCase()}`)"
  >
    <span aria-hidden="true" class="leading-none">{{ copied ? '✓' : '⧉' }}</span>
    <span v-if="variant !== 'icon'">{{ copied ? 'Copied' : label }}</span>
  </button>
</template>
