<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    modelValue: number
    min: number
    max: number
    step?: number
    /** Unit appended to the visible and announced value. */
    unit?: string
  }>(),
  { step: 1, unit: '' },
)

const emit = defineEmits<{ 'update:modelValue': [number] }>()

const inputId = useId()

const readout = computed(() => `${props.modelValue}${props.unit}`)

function onInput(event: Event) {
  emit('update:modelValue', Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <div>
    <div class="flex items-baseline justify-between gap-4">
      <label :for="inputId" class="caption">{{ label }}</label>
      <output :for="inputId" class="caption tabular-nums text-ink">{{ readout }}</output>
    </div>

    <input
      :id="inputId"
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :aria-valuetext="readout"
      class="tool-range mt-3 w-full"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
/* Native range, restyled rather than replaced: keyboard stepping, touch drag
   and the accessible value announcement all come for free. */
.tool-range {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  height: 2.75rem;
  cursor: pointer;
}

.tool-range::-webkit-slider-runnable-track {
  height: 1px;
  background: var(--color-ink);
}

.tool-range::-moz-range-track {
  height: 1px;
  background: var(--color-ink);
}

.tool-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.125rem;
  height: 1.125rem;
  margin-top: -0.5625rem;
  border: 1px solid var(--color-ink);
  border-radius: 9999px;
  background: var(--color-paper);
}

.tool-range::-moz-range-thumb {
  width: 1.125rem;
  height: 1.125rem;
  border: 1px solid var(--color-ink);
  border-radius: 9999px;
  background: var(--color-paper);
}

.tool-range:focus-visible::-webkit-slider-thumb {
  background: var(--color-blue);
  border-color: var(--color-blue);
}

.tool-range:focus-visible::-moz-range-thumb {
  background: var(--color-blue);
  border-color: var(--color-blue);
}
</style>
