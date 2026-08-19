<script setup lang="ts">
import { hexToRgb, hexToHsl, contrastRatio, bestTextOn, formatRatio, wcagVerdicts } from '~/utils/tools/color'
import type { TokenRole } from '~/utils/tools/contrast-batch'

const props = defineProps<{
  hex: string
  name: string
  path: string[]
  resolvedFrom?: string
  role: TokenRole
}>()

const emit = defineEmits<{ 'update:role': [TokenRole] }>()

const roleOptions: { value: TokenRole; label: string }[] = [
  { value: 'foreground', label: 'Text' },
  { value: 'background', label: 'Background' },
  { value: 'unassigned', label: 'Both' },
]

const textColor = computed(() => bestTextOn(props.hex))

const hsl = computed(() => {
  const value = hexToHsl(props.hex)
  if (!value) return null
  return { h: Math.round(value.h), s: Math.round(value.s), l: Math.round(value.l) }
})

const ratioOnWhite = computed(() => contrastRatio(props.hex, '#ffffff'))
const ratioOnBlack = computed(() => contrastRatio(props.hex, '#000000'))

const wcagChecks = computed(() => {
  const ratio = ratioOnWhite.value
  return [
    { label: 'AA Normal', threshold: 4.5, passes: ratio >= 4.5 },
    { label: 'AA Large', threshold: 3, passes: ratio >= 3 },
    { label: 'AAA', threshold: 7, passes: ratio >= 7 },
  ]
})

const fullPath = computed(() => props.path.join('.'))
</script>

<template>
  <div class="flex flex-col overflow-hidden border border-rule">
    <!-- Colour block -->
    <div
      class="flex min-h-20 items-end justify-between px-3 pb-2"
      :style="{ backgroundColor: hex, color: textColor }"
    >
      <span class="caption font-bold opacity-80">
        {{ wcagChecks.find(c => c.label === 'AAA')?.passes ? 'AAA' : wcagChecks.find(c => c.label === 'AA Normal')?.passes ? 'AA' : '—' }}
        {{ formatRatio(ratioOnWhite) }}
      </span>
    </div>

    <!-- Token info -->
    <div class="flex flex-1 flex-col gap-3 p-3">
      <div>
        <p class="text-[0.8125rem] font-bold leading-snug">{{ name }}</p>
        <p v-if="resolvedFrom" class="text-[0.75rem] text-ink-muted">→ {{ resolvedFrom }}</p>
        <p class="mt-1 font-mono text-[0.75rem] tabular-nums text-ink-muted">{{ hex }}</p>
        <p v-if="hsl" class="font-mono text-[0.75rem] tabular-nums text-ink-muted">
          H:{{ hsl.h }} S:{{ hsl.s }} L:{{ hsl.l }}
        </p>
      </div>

      <!-- WCAG AA checks -->
      <ul class="flex flex-col gap-1 border-t border-rule pt-3">
        <li
          v-for="check in wcagChecks"
          :key="check.label"
          class="flex items-center gap-1.5 text-[0.75rem]"
        >
          <span
            aria-hidden="true"
            class="text-[0.625rem]"
            :class="check.passes ? 'text-pass' : 'text-fail'"
          >
            {{ check.passes ? '✓' : '✕' }}
          </span>
          <span class="font-bold" :class="check.passes ? 'text-pass' : 'text-fail'">
            {{ check.label }}
          </span>
          <span class="tabular-nums text-ink-muted">{{ check.threshold }}:1</span>
        </li>
      </ul>

      <!-- Role selector -->
      <div class="mt-auto pt-1">
        <span class="inline-flex border border-ink">
          <label
            v-for="option in roleOptions"
            :key="option.value"
            class="contents"
          >
            <input
              type="radio"
              :name="`role-card-${fullPath}`"
              :value="option.value"
              :checked="role === option.value"
              class="peer sr-only"
              @change="emit('update:role', option.value)"
            />
            <span
              class="caption flex items-center px-2.5 py-1 normal-case tracking-normal transition-colors duration-200 ease-editorial peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-blue peer-focus-visible:shadow-[inset_0_0_0_4px_var(--color-paper)]"
              :class="
                role === option.value
                  ? 'bg-ink text-paper font-bold'
                  : 'text-ink-muted hover:text-ink'
              "
            >
              {{ option.label }}
            </span>
          </label>
        </span>
      </div>
    </div>
  </div>
</template>
