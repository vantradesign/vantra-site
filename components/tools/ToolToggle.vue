<script setup lang="ts">
import type { ToggleOption } from '~/types/tools'

const props = defineProps<{
  options: ToggleOption[]
  modelValue: string
  /** Always required. Set hideLabel when a nearby heading already says it. */
  label: string
  hideLabel?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const groupId = useId()

function isActive(option: ToggleOption) {
  return props.modelValue === option.value
}
</script>

<template>
  <div>
    <p :id="groupId" :class="hideLabel ? 'sr-only' : 'caption mb-3'">{{ label }}</p>

    <!-- Both states stay visible, and the active one is marked by weight and an
         underline as well as by colour, so it survives greyscale. -->
    <div class="inline-flex border border-ink" role="radiogroup" :aria-labelledby="groupId">
      <button
        v-for="(option, index) in options"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="isActive(option)"
        class="caption min-h-11 px-5 normal-case tracking-normal transition-colors duration-200 ease-editorial"
        :class="[
          index > 0 ? 'border-l border-ink' : '',
          isActive(option)
            ? 'bg-ink text-paper font-bold underline underline-offset-4'
            : 'text-ink-muted hover:text-ink',
        ]"
        @click="emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
