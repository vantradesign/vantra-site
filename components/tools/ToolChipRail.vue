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

/**
 * [A11y] Native radios, restyled rather than replaced — the same reasoning
 * ToolSlider records for `input[type=range]`.
 *
 * This was previously a row of `<button role="radio">`. That announced a
 * radiogroup and then did not behave like one: no roving tabindex, no arrow-key
 * handling, and every chip its own tab stop — so on the contrast checker a
 * keyboard user tabbed through two full palettes to reach the next control, and
 * the arrow keys the role promises did nothing. Failing SC 2.1.1 against a role
 * you asserted yourself is the avoidable kind of failure.
 *
 * With a real radio group the browser supplies arrow navigation, one tab stop per
 * group, correct "n of m" announcements and form semantics. The visual chip is
 * the sibling <span>; the input stays focusable but invisible, so :focus-visible
 * still lands on it and `peer-focus-visible` paints the ring on the chip.
 *
 * `name` must be unique per group, hence groupId.
 */
function isActive(chip: Chip) {
  return props.modelValue === chip.value
}
</script>

<template>
  <div>
    <p :id="groupId" class="caption mb-3">{{ label }}</p>

    <!-- Horizontal scroll is intentional on narrow screens: the rail keeps one
         line so it never pushes the inputs below the fold. -->
    <!-- The fade on the right edge signals that the rail continues past the
         viewport; without it the palette looks shorter than it is. Decorative and
         non-interactive, so it must not swallow clicks. -->
    <div class="relative">
      <div
        class="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2"
        role="radiogroup"
        :aria-labelledby="groupId"
      >
        <label
          v-for="chip in chips"
          :key="chip.value"
          class="shrink-0 snap-start"
        >
          <input
            type="radio"
            :name="groupId"
            :value="chip.value"
            :checked="isActive(chip)"
            class="peer sr-only"
            @change="emit('update:modelValue', chip.value)"
          />
          <span
            class="caption flex items-center gap-2 border px-3 py-2 normal-case tracking-normal transition-colors duration-200 ease-editorial peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-blue peer-focus-visible:shadow-[0_0_0_5px_var(--color-paper)]"
            :class="
              isActive(chip)
                ? 'border-ink bg-ink text-paper font-bold'
                : 'border-rule text-ink-muted hover:border-ink hover:text-ink'
            "
          >
            <span
              v-if="chip.swatch"
              class="size-3.5 shrink-0 border border-ink/15"
              :style="{ backgroundColor: chip.swatch }"
              aria-hidden="true"
            />
            <span>{{ chip.label }}</span>
            <span v-if="chip.description" class="sr-only">, {{ chip.description }}</span>
          </span>
        </label>
      </div>

      <div
        class="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-paper to-transparent"
        aria-hidden="true"
      />
    </div>
  </div>
</template>
