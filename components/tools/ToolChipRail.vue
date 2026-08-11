<script setup lang="ts">
import type { Chip } from '~/types/tools'

const props = defineProps<{
  chips: Chip[]
  modelValue?: string | null
  /** Visible group label. Doubles as the radiogroup's accessible name. */
  label: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const groupId = useId()

function isActive(chip: Chip) {
  return props.modelValue === chip.value
}
</script>

<template>
  <div>
    <p :id="groupId" class="caption mb-3">{{ label }}</p>

    <!-- Horizontal scroll is intentional on narrow screens: the rail keeps one
         line so it never pushes the inputs below the fold. -->
    <div
      class="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2"
      role="radiogroup"
      :aria-labelledby="groupId"
    >
      <button
        v-for="chip in chips"
        :key="chip.value"
        type="button"
        role="radio"
        :aria-checked="isActive(chip)"
        class="caption shrink-0 snap-start border px-3 py-2 normal-case tracking-normal transition-colors duration-200 ease-editorial"
        :class="
          isActive(chip)
            ? 'border-ink bg-ink text-paper font-bold'
            : 'border-rule text-ink-muted hover:border-ink hover:text-ink'
        "
        @click="emit('update:modelValue', chip.value)"
      >
        <span class="flex items-center gap-2">
          <span
            v-if="chip.swatch"
            class="size-3.5 shrink-0 border border-ink/15"
            :style="{ backgroundColor: chip.swatch }"
            aria-hidden="true"
          />
          <span>{{ chip.label }}</span>
        </span>
        <span v-if="chip.description" class="sr-only">, {{ chip.description }}</span>
      </button>
    </div>
  </div>
</template>
