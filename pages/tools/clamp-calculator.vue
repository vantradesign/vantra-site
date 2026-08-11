<script setup lang="ts">
import { clampAtViewport, computeClamp, formatUnit } from '~/utils/tools/scale'
import type { ToggleOption } from '~/types/tools'

useSeoMeta({
  title: 'CSS clamp() Calculator',
  description:
    'Calculate a single fluid CSS clamp() value for a one-off size, with a viewport simulator that shows exactly how the interpolation behaves.',
})

const modes: ToggleOption[] = [
  { value: 'typography', label: 'Typography' },
  { value: 'spacing', label: 'Spacing' },
]

const mode = ref('typography')

const minValue = ref('18')
const maxValue = ref('48')
const minViewport = ref('320')
const maxViewport = ref('1440')
const simulated = ref(768)

function positive(value: string): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const input = computed(() => ({
  minValue: positive(minValue.value) ?? 16,
  maxValue: positive(maxValue.value) ?? 32,
  minViewport: positive(minViewport.value) ?? 320,
  maxViewport: positive(maxViewport.value) ?? 1440,
}))

const viewportError = computed(() =>
  input.value.maxViewport > input.value.minViewport
    ? undefined
    : 'The maximum viewport must be larger than the minimum.',
)

const valueError = computed(() =>
  positive(minValue.value) && positive(maxValue.value)
    ? undefined
    : 'Both values must be greater than zero.',
)

const result = computed(() => computeClamp(input.value))
const current = computed(() => clampAtViewport(input.value, simulated.value))

const locked = computed(() => {
  if (simulated.value <= input.value.minViewport) return 'held at the minimum'
  if (simulated.value >= input.value.maxViewport) return 'held at the maximum'
  return 'interpolating'
})

const explanation = computed(() => {
  const { minValue: lo, maxValue: hi, minViewport: from, maxViewport: to } = input.value

  return `At ${simulated.value}px wide the value resolves to ${formatUnit(current.value, 2)}px — ${locked.value}. It stays at ${formatUnit(lo, 2)}px below ${from}px, grows by ${formatUnit((hi - lo) / (to - from) * 100, 3)}px for every 100px of viewport, and stops at ${formatUnit(hi, 2)}px from ${to}px upwards.`
})

const css = computed(() =>
  mode.value === 'typography'
    ? `font-size: ${result.value.css};`
    : `padding-block: ${result.value.css};`,
)

/* Simulator bounds are fixed at 320–1440 by the brief; the inputs can go
   outside that range, which is why the readout reports the lock state. */
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 10"
      cover-line="One value that knows how wide the window is."
      lead="This is the single-value tool: a container padding, a gutter, a hero that has to stop growing at 1440px. Set a floor, a ceiling and the two viewports they belong to, then drag the simulator and watch the number behave. For a whole set of sizes at once, the type and spacing scales emit clamp() per step."
    />

    <section aria-labelledby="clamp-inputs-heading" class="gutter mt-20 md:mt-28">
      <div class="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <h2 id="clamp-inputs-heading" class="caption">Inputs</h2>
        <ToolToggle v-model="mode" label="Preview as" :options="modes" hide-label />
      </div>

      <div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <ToolField
          v-model="minValue"
          label="Minimum value"
          type="number"
          inputmode="decimal"
          :min="1"
          suffix="px"
          :error="valueError"
        />
        <ToolField
          v-model="maxValue"
          label="Maximum value"
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
    </section>

    <section aria-labelledby="simulator-heading" class="gutter mt-section">
      <h2 id="simulator-heading" class="caption">Viewport simulator</h2>

      <div class="mt-8 max-w-xl">
        <ToolSlider
          v-model="simulated"
          label="Simulated viewport width"
          :min="320"
          :max="1440"
          :step="1"
          unit="px"
        />
      </div>

      <p class="mt-8 measure text-lead text-ink-muted" aria-live="polite">
        {{ explanation }}
      </p>

      <div class="mt-14 border-t border-ink pt-14">
        <div v-if="mode === 'typography'">
          <p
            class="font-display leading-[1.05] tracking-[-0.02em] text-balance measure-tight"
            :style="{ fontSize: `${current}px` }"
          >
            Built for the quiet parts of the interface.
          </p>
        </div>

        <div v-else class="border-y border-rule">
          <div
            class="bg-cyan-soft"
            :style="{ paddingBlock: `${current}px` }"
            role="img"
            :aria-label="`Spacing block at ${formatUnit(current, 2)} pixels of vertical padding`"
          >
            <p class="caption px-4 tabular-nums text-ink">
              padding-block {{ formatUnit(current, 2) }}px
            </p>
          </div>
        </div>

        <p class="caption mt-8 tabular-nums text-ink-muted">
          {{ simulated }}px viewport — {{ formatUnit(current, 2) }}px resolved
        </p>
      </div>
    </section>

    <section aria-labelledby="clamp-output-heading" class="gutter mt-section">
      <h2 id="clamp-output-heading" class="caption">Copy-ready value</h2>

      <p class="mt-6 font-display text-title tabular-nums break-words" aria-live="polite">
        {{ result.css }}
      </p>

      <div class="mt-10">
        <CodeBlock :code="css" label="Copy-ready CSS" copy-label="Copy CSS" />
      </div>

      <p class="caption mt-8 normal-case tracking-normal measure text-ink-muted">
        The preferred term is written in rem plus vw rather than vw alone, so the value still
        responds when a reader zooms the text. For a whole set of sizes at once, use the
        <AppLink to="/tools/type-scale" accent="blue">fluid type scale</AppLink> or the
        <AppLink to="/tools/spacing-scale" accent="blue">fluid spacing scale</AppLink>.
      </p>
    </section>

    <ToolFooterNav slug="clamp-calculator" />
  </div>
</template>
