<script setup lang="ts">
/**
 * A native `<select>`, restyled to the same rule-and-caption language as
 * <ToolField />.
 *
 * Added for the layout builder, which exposes eight enumerated CSS properties on
 * one screen. A <ToolChipRail /> each would be eight horizontally scrolling rails
 * and a much longer tab order; the native control keeps them compact and brings
 * its own keyboard behaviour and mobile picker.
 */
const props = defineProps<{
  label: string
  modelValue: string
  options: readonly string[]
  hint?: string
  /** Set when a nearby heading already names the control. */
  hideLabel?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const selectId = useId()
const hintId = useId()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div>
    <label :for="selectId" :class="props.hideLabel ? 'sr-only' : 'caption block'">
      {{ props.label }}
    </label>

    <select
      :id="selectId"
      :value="props.modelValue"
      :aria-describedby="props.hint ? hintId : undefined"
      class="mt-2 min-h-11 w-full appearance-none border-b border-rule bg-transparent py-2 pr-6 font-sans text-body text-ink outline-none transition-colors duration-200 ease-editorial focus:border-ink"
      @change="onChange"
    >
      <option v-for="option in props.options" :key="option" :value="option">{{ option }}</option>
    </select>

    <p v-if="props.hint" :id="hintId" class="mt-2 text-[0.9375rem] leading-snug text-ink-muted">
      {{ props.hint }}
    </p>
  </div>
</template>
