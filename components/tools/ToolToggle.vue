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

/**
 * [A11y] Native radios, restyled — see the note in ToolChipRail.
 *
 * Previously `<button role="radio">` with no arrow-key handling and one tab stop
 * per segment, which is not the radiogroup behaviour the role announces. The
 * browser now provides navigation and "n of m" for free.
 */
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
      <label v-for="(option, index) in options" :key="option.value" class="contents">
        <input
          type="radio"
          :name="groupId"
          :value="option.value"
          :checked="isActive(option)"
          class="peer sr-only"
          @change="emit('update:modelValue', option.value)"
        />
        <span
          class="caption flex min-h-11 items-center px-5 normal-case tracking-normal transition-colors duration-200 ease-editorial peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-blue peer-focus-visible:shadow-[inset_0_0_0_4px_var(--color-paper)]"
          :class="[
            index > 0 ? 'border-l border-ink' : '',
            isActive(option)
              ? 'bg-ink text-paper font-bold underline underline-offset-4'
              : 'text-ink-muted hover:text-ink',
          ]"
        >
          {{ option.label }}
        </span>
      </label>
    </div>
  </div>
</template>
