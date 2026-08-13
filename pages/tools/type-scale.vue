<script setup lang="ts">
import {
  TYPE_RATIOS,
  buildFluidTypeScale,
  buildTypeScale,
  fluidStepAt,
  formatUnit,
} from '~/utils/tools/scale'
import type { Chip, ToggleOption } from '~/types/tools'

useToolPageSeo({
  slug: 'type-scale',
  title: 'Modular Type Scale',
  description:
    'Generate a fluid or static typographic scale from a base size and a ratio, previewed as a specimen page, with copy-ready CSS custom properties.',
})

/* Fluid is the default because every headline token in this site's own theme
   is a clamp(). A static scale is still one click away for systems that ship
   stepped rem tokens. */
const modes: ToggleOption[] = [
  { value: 'fluid', label: 'Fluid' },
  { value: 'static', label: 'Static' },
]

const mode = ref('fluid')
const isFluid = computed(() => mode.value === 'fluid')

const base = ref('16')
const ratio = ref('1.25')

const minBase = ref('16')
const maxBase = ref('20')
const minRatio = ref('1.2')
const maxRatio = ref('1.25')
const minViewport = ref('320')
const maxViewport = ref('1440')
const simulated = ref(768)

const chips: Chip[] = TYPE_RATIOS.map((entry) => ({
  value: String(entry.value),
  label: `${entry.label} ${entry.value}`,
  description: `ratio ${entry.value}`,
}))

function positive(value: string): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function ratioOf(value: string, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 1 ? parsed : fallback
}

function nameOf(value: number): string {
  return TYPE_RATIOS.find((entry) => entry.value === value)?.label ?? 'Custom ratio'
}

const baseValue = computed(() => positive(base.value))
const baseError = computed(() =>
  baseValue.value ? undefined : 'Base size must be a number greater than zero.',
)

const ratioValue = computed(() => ratioOf(ratio.value, 1.25))
const ratioName = computed(() => nameOf(ratioValue.value))

const minRatioValue = computed(() => ratioOf(minRatio.value, 1.2))
const maxRatioValue = computed(() => ratioOf(maxRatio.value, 1.25))

const range = computed(() => ({
  minViewport: positive(minViewport.value) ?? 320,
  maxViewport: positive(maxViewport.value) ?? 1440,
}))

const viewportError = computed(() =>
  range.value.maxViewport > range.value.minViewport
    ? undefined
    : 'The maximum viewport must be larger than the minimum.',
)

const fluidBaseError = computed(() =>
  positive(minBase.value) && positive(maxBase.value)
    ? undefined
    : 'Both base sizes must be greater than zero.',
)

const staticSteps = computed(() => buildTypeScale(baseValue.value ?? 16, ratioValue.value))

const fluidSteps = computed(() =>
  buildFluidTypeScale({
    minBase: positive(minBase.value) ?? 16,
    maxBase: positive(maxBase.value) ?? 20,
    minRatio: minRatioValue.value,
    maxRatio: maxRatioValue.value,
    ...range.value,
  }),
)

const sample = 'Design systems fail slowly'

function staticStepCss(name: string, rem: number) {
  return `--text-${name}: ${formatUnit(rem)}rem;`
}

function fluidStepCss(name: string, css: string) {
  return `--text-${name}: ${css};`
}

/**
 * One row model for both modes, largest step first. Keeping the branch here
 * rather than in the template is what stops the specimen list from doubling.
 */
const rows = computed(() => {
  const list = isFluid.value
    ? fluidSteps.value.map((step) => ({
        name: step.name,
        /** Size the specimen renders at, i.e. resolved at the simulated width. */
        size: fluidStepAt(step, range.value, simulated.value),
        meta: `${formatUnit(step.minPx, 1)}px → ${formatUnit(step.maxPx, 1)}px`,
        css: fluidStepCss(step.name, step.clamp.css),
      }))
    : staticSteps.value.map((step) => ({
        name: step.name,
        size: step.px,
        meta: `${formatUnit(step.px, 1)}px / ${formatUnit(step.rem)}rem`,
        css: staticStepCss(step.name, step.rem),
      }))

  return [...list].reverse()
})

const allCss = computed(() => {
  if (!isFluid.value) {
    return [
      `/* Modular scale — base ${formatUnit(baseValue.value ?? 16)}px, ratio ${ratioValue.value} (${ratioName.value}) */`,
      ':root {',
      ...staticSteps.value.map((step) => `  ${staticStepCss(step.name, step.rem)}`),
      '}',
    ].join('\n')
  }

  return [
    `/* Fluid modular scale — ${formatUnit(positive(minBase.value) ?? 16)}px at ${range.value.minViewport}px, ${formatUnit(positive(maxBase.value) ?? 20)}px at ${range.value.maxViewport}px */`,
    `/* Ratio ${minRatioValue.value} (${nameOf(minRatioValue.value)}) → ${maxRatioValue.value} (${nameOf(maxRatioValue.value)}) */`,
    ':root {',
    ...fluidSteps.value.map((step) => `  ${fluidStepCss(step.name, step.clamp.css)}`),
    '}',
  ].join('\n')
})
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 04"
      cover-line="A scale is a promise that no size is accidental."
      lead="Pick a base size, pick a ratio, and every heading on every page inherits the same logic. A scale that reads well at 1440px is usually too steep at 320px, so the fluid mode takes a ratio at each end and interpolates every step between them."
    />

    <section aria-labelledby="controls-heading" class="gutter mt-20 md:mt-28">
      <!-- The toggle sits on the heading's line rather than under it: a section
           heading and a control label in the same caption style, stacked, read
           as two headings and no control. -->
      <div class="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <h2 id="controls-heading" class="caption">Inputs</h2>
        <ToolToggle v-model="mode" label="Scale type" :options="modes" hide-label />
      </div>

      <div v-if="!isFluid" class="mt-12 md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-3">
          <ToolField
            v-model="base"
            label="Base size"
            type="number"
            inputmode="decimal"
            :min="1"
            :step="1"
            suffix="px"
            :error="baseError"
            hint="Body copy size. 16 matches the browser default."
          />
        </div>

        <div class="mt-10 md:col-span-8 md:col-start-5 md:mt-0">
          <ToolChipRail v-model="ratio" label="Ratio" :chips="chips" />
          <p class="caption mt-4 normal-case tracking-normal text-ink-muted" aria-live="polite">
            {{ ratioName }} — each step is {{ ratioValue }}× the one below it.
          </p>
        </div>
      </div>

      <div v-else class="mt-12">
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <ToolField
            v-model="minBase"
            label="Base at small end"
            type="number"
            inputmode="decimal"
            :min="1"
            suffix="px"
            :error="fluidBaseError"
          />
          <ToolField
            v-model="maxBase"
            label="Base at large end"
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

        <div class="mt-12 md:grid md:grid-cols-12 md:gap-x-8">
          <div class="md:col-span-6">
            <ToolChipRail v-model="minRatio" label="Ratio at small end" :chips="chips" />
          </div>
          <div class="mt-10 md:col-span-6 md:mt-0">
            <ToolChipRail v-model="maxRatio" label="Ratio at large end" :chips="chips" />
          </div>
        </div>

        <p class="caption mt-6 normal-case tracking-normal measure text-ink-muted" aria-live="polite">
          {{ nameOf(minRatioValue) }} at {{ range.minViewport }}px, {{ nameOf(maxRatioValue) }} at
          {{ range.maxViewport }}px. Every step interpolates between the two.
        </p>

        <div class="mt-12 max-w-xl">
          <ToolSlider
            v-model="simulated"
            label="Preview at viewport width"
            :min="320"
            :max="1440"
            :step="1"
            unit="px"
          />
          <p class="caption mt-3 normal-case tracking-normal text-ink-muted">
            The specimen below is set at the size each step resolves to at this width.
          </p>
        </div>
      </div>
    </section>

    <section aria-labelledby="specimen-heading" class="gutter mt-section">
      <div class="flex flex-wrap items-baseline justify-between gap-6">
        <h2 id="specimen-heading" class="caption">Specimen</h2>
        <CopyButton
          :value="allCss"
          label="Copy all as CSS variables"
          variant="solid"
          message="Scale copied as CSS custom properties"
        />
      </div>

      <ul class="mt-10 border-t border-ink">
        <li v-for="row in rows" :key="row.name" class="border-b border-rule py-10">
          <div class="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
            <p class="caption text-ink-muted">
              --text-{{ row.name }}
              <span class="ml-3 tabular-nums text-ink-muted">
                {{ row.meta }}
                <template v-if="isFluid">, now {{ formatUnit(row.size, 1) }}px</template>
              </span>
            </p>

            <CopyButton
              :value="row.css"
              :label="`Copy ${row.name}`"
              :aria-label="`Copy CSS variable for step ${row.name}`"
              :message="`--text-${row.name} copied`"
            />
          </div>

          <p
            class="mt-6 font-display leading-[1.05] tracking-[-0.015em]"
            :style="{ fontSize: `${row.size}px` }"
          >
            {{ sample }}
          </p>
        </li>
      </ul>
    </section>

    <section aria-labelledby="output-heading" class="gutter mt-section">
      <h2 id="output-heading" class="sr-only">Copy-ready output</h2>
      <CodeBlock :code="allCss" label="Copy-ready CSS" copy-label="Copy CSS" />

      <p v-if="isFluid" class="caption mt-8 normal-case tracking-normal measure text-ink-muted">
        Each step is a single fluid value. For a one-off size that is not part of the scale — a
        container padding, a gap, a radius — use the
        <AppLink to="/tools/clamp-calculator" accent="blue">clamp() calculator</AppLink>.
      </p>
    </section>

    <ToolReference slug="type-scale" />

    <ToolFooterNav slug="type-scale" />
  </div>
</template>
