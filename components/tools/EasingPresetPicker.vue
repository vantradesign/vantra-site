<script setup lang="ts">
import { EASING_FAMILIES, presetToPoints, bezierPoint } from '~/utils/tools/easing'
import type { EasingPresetEntry } from '~/utils/tools/easing'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const groupId = useId()

function isActive(preset: EasingPresetEntry) {
  return props.modelValue === preset.id
}

function select(preset: EasingPresetEntry) {
  emit('update:modelValue', preset.id)
}

/**
 * Generate an SVG path for the mini-preview curve thumbnail.
 * Uses 20 sample points to draw the curve in a 32x16 viewBox.
 */
function miniCurvePath(preset: EasingPresetEntry): string {
  const points = presetToPoints(preset)
  const w = 32
  const h = 16
  const steps = 20
  const parts: string[] = []

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const { x, y } = bezierPoint(points, t)
    const sx = x * w
    const sy = (1 - y) * h
    parts.push(`${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`)
  }

  return parts.join(' ')
}

</script>

<template>
  <div>
    <p :id="groupId" class="caption mb-4">Presets</p>

    <div class="space-y-6">
      <fieldset
        v-for="family in EASING_FAMILIES"
        :key="family.id"
        class="border-none p-0"
      >
        <legend class="caption mb-2 text-[0.6875rem] font-bold text-ink-muted">
          {{ family.label }}
        </legend>

        <p
          v-if="family.note"
          class="mb-2 text-[0.6875rem] leading-snug text-ink-faint"
        >
          ⚠ {{ family.note }}
        </p>

        <div
          class="flex flex-wrap gap-1.5"
          role="radiogroup"
          :aria-label="family.label + ' presets'"
        >
          <label
            v-for="preset in family.presets"
            :key="preset.id"
            class="group shrink-0"
          >
            <input
              type="radio"
              :name="groupId"
              :value="preset.id"
              :checked="isActive(preset)"
              class="peer sr-only"
              @change="select(preset)"
            />
            <span
              class="flex cursor-pointer items-center gap-1.5 border px-2 py-1.5 text-[0.6875rem] leading-none transition-colors duration-200 ease-editorial peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-blue peer-focus-visible:shadow-[0_0_0_5px_var(--color-paper)]"
              :class="
                isActive(preset)
                  ? 'border-ink bg-ink text-paper font-bold'
                  : 'border-rule text-ink-muted hover:border-ink hover:text-ink'
              "
            >
              <svg
                class="shrink-0"
                width="32"
                height="16"
                viewBox="0 0 32 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  :d="miniCurvePath(preset)"
                  :stroke="isActive(preset) ? 'var(--color-paper)' : 'var(--color-ink)'"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ preset.label }}</span>
            </span>
          </label>
        </div>
      </fieldset>
    </div>
  </div>
</template>
