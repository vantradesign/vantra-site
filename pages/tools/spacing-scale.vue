<script setup lang="ts">
import {
  buildFluidSpacingScale,
  buildSpacingScale,
  fluidStepAt,
  formatUnit,
} from '~/utils/tools/scale'
import type { ToggleOption } from '~/types/tools'

useSeoMeta({
  title: 'Spacing Scale Generator',
  description:
    'Fluid or static spacing tokens on a 4pt or 8pt grid, drawn to proportion, with copy-ready CSS custom properties.',
})

/* Same default as the type scale, and for the same reason: gaps that work at
   1440px are almost always too generous at 320px. */
const modes: ToggleOption[] = [
  { value: 'fluid', label: 'Fluid' },
  { value: 'static', label: 'Static' },
]

const mode = ref('fluid')
const isFluid = computed(() => mode.value === 'fluid')

const options: ToggleOption[] = [
  { value: '4', label: '4pt grid' },
  { value: '8', label: '8pt grid' },
]

const grid = ref('8')
const unit = computed<4 | 8>(() => (grid.value === '4' ? 4 : 8))

const smallUnit = ref('4')
const largeUnit = ref('8')
const minViewport = ref('320')
const maxViewport = ref('1440')
const simulated = ref(768)

function positive(value: string): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const range = computed(() => ({
  minViewport: positive(minViewport.value) ?? 320,
  maxViewport: positive(maxViewport.value) ?? 1440,
}))

const viewportError = computed(() =>
  range.value.maxViewport > range.value.minViewport
    ? undefined
    : 'The maximum viewport must be larger than the minimum.',
)

const unitError = computed(() =>
  positive(smallUnit.value) && positive(largeUnit.value)
    ? undefined
    : 'Both grid units must be greater than zero.',
)

const staticSteps = computed(() => buildSpacingScale(unit.value))

const fluidSteps = computed(() =>
  buildFluidSpacingScale({
    minUnit: positive(smallUnit.value) ?? 4,
    maxUnit: positive(largeUnit.value) ?? 8,
    ...range.value,
  }),
)

function staticStepCss(name: string, rem: number) {
  return `--space-${name}: ${formatUnit(rem, 4)}rem;`
}

function fluidStepCss(name: string, css: string) {
  return `--space-${name}: ${css};`
}

/** One row model for both modes, so the bar chart is written once. */
const rows = computed(() =>
  isFluid.value
    ? fluidSteps.value.map((step) => ({
        name: step.name,
        size: fluidStepAt(step, range.value, simulated.value),
        meta: `${formatUnit(step.minPx, 1)}px → ${formatUnit(step.maxPx, 1)}px`,
        css: fluidStepCss(step.name, step.clamp.css),
      }))
    : staticSteps.value.map((step) => ({
        name: step.name,
        size: step.px,
        meta: `${formatUnit(step.px, 1)}px / ${formatUnit(step.rem, 4)}rem`,
        css: staticStepCss(step.name, step.rem),
      })),
)

const largest = computed(() => rows.value.at(-1)?.size || 1)

const allCss = computed(() => {
  if (!isFluid.value) {
    return [
      `/* Spacing scale — ${unit.value}pt grid */`,
      ':root {',
      ...staticSteps.value.map((step) => `  ${staticStepCss(step.name, step.rem)}`),
      '}',
    ].join('\n')
  }

  return [
    `/* Fluid spacing scale — ${formatUnit(positive(smallUnit.value) ?? 4)}pt grid at ${range.value.minViewport}px, ${formatUnit(positive(largeUnit.value) ?? 8)}pt at ${range.value.maxViewport}px */`,
    ':root {',
    ...fluidSteps.value.map((step) => `  ${fluidStepCss(step.name, step.clamp.css)}`),
    '}',
  ].join('\n')
})
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 05"
      cover-line="Space is the part of the layout you have to decide on purpose."
      lead="Every gap in an interface is either on the grid or an accident, and accidents accumulate faster than components do. Pick a base unit, take the ten steps, and stop negotiating margins one component at a time — fluid, so the gutters tighten on a phone without a single breakpoint."
    />

    <section aria-labelledby="grid-heading" class="gutter mt-20 md:mt-28">
      <!-- Same rule as the type scale: the mode sits on the heading line, so
           the grid toggle below is the only labelled control in the section. -->
      <div class="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <h2 id="grid-heading" class="caption">Inputs</h2>
        <ToolToggle v-model="mode" label="Scale type" :options="modes" hide-label />
      </div>

      <div v-if="!isFluid" class="mt-12">
        <ToolToggle v-model="grid" label="Grid" :options="options" />
        <p class="caption mt-6 normal-case tracking-normal text-ink-muted" aria-live="polite">
          Ten steps from {{ rows[0]?.size }}px to {{ largest }}px, all multiples of {{ unit }}.
        </p>
      </div>

      <div v-else class="mt-12">
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <ToolField
            v-model="smallUnit"
            label="Grid unit at small end"
            type="number"
            inputmode="decimal"
            :min="1"
            suffix="px"
            :error="unitError"
          />
          <ToolField
            v-model="largeUnit"
            label="Grid unit at large end"
            type="number"
            inputmode="decimal"
            :min="1"
            suffix="px"
          />
          <ToolField
            v-model="minViewport"
            label="Minimum viewport"
            type="number"
            inputmode="numeric"
            :min="1"
            suffix="px"
            :error="viewportError"
          />
          <ToolField
            v-model="maxViewport"
            label="Maximum viewport"
            type="number"
            inputmode="numeric"
            :min="1"
            suffix="px"
          />
        </div>

        <div class="mt-12 max-w-xl">
          <ToolSlider
            v-model="simulated"
            label="Preview at viewport width"
            :min="320"
            :max="1440"
            :step="1"
            unit="px"
          />
          <p class="caption mt-3 normal-case tracking-normal text-ink-muted" aria-live="polite">
            Bars are drawn at the size each step resolves to at this width.
          </p>
        </div>
      </div>
    </section>

    <section aria-labelledby="bars-heading" class="gutter mt-section">
      <div class="flex flex-wrap items-baseline justify-between gap-6">
        <h2 id="bars-heading" class="caption">The scale</h2>
        <CopyButton
          :value="allCss"
          label="Copy all as CSS variables"
          variant="solid"
          message="Spacing scale copied as CSS custom properties"
        />
      </div>

      <ul class="mt-10 border-t border-ink">
        <li
          v-for="row in rows"
          :key="row.name"
          class="grid items-center gap-4 border-b border-rule py-9 md:grid-cols-12 md:gap-x-8"
        >
          <p class="caption md:col-span-2">
            --space-{{ row.name }}
          </p>

          <p class="caption tabular-nums text-ink-muted md:col-span-3">
            {{ row.meta }}
          </p>

          <div class="md:col-span-5">
            <div
              class="h-3 bg-blue"
              :style="{ width: `${(row.size / largest) * 100}%` }"
              role="img"
              :aria-label="`${formatUnit(row.size, 1)} pixels, ${Math.round((row.size / largest) * 100)} percent of the largest step`"
            />
          </div>

          <div class="md:col-span-2 md:text-right">
            <CopyButton
              :value="row.css"
              :label="`Copy ${row.name}`"
              :aria-label="`Copy CSS variable for spacing step ${row.name}`"
              :message="`--space-${row.name} copied`"
            />
          </div>
        </li>
      </ul>
    </section>

    <section aria-labelledby="spacing-output-heading" class="gutter mt-section">
      <h2 id="spacing-output-heading" class="sr-only">Copy-ready output</h2>
      <CodeBlock :code="allCss" label="Copy-ready CSS" copy-label="Copy CSS" />

      <p v-if="isFluid" class="caption mt-8 normal-case tracking-normal measure text-ink-muted">
        For a one-off value outside the scale, or to see how the interpolation is derived, use the
        <AppLink to="/tools/clamp-calculator" accent="blue">clamp() calculator</AppLink>.
      </p>
    </section>

    <ToolFooterNav slug="spacing-scale" />
  </div>
</template>
