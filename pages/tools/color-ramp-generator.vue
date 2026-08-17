<!--
  PM FRAMING
  Problem: Designers pick one brand colour but need 10+ tint/shade variants for
  hover states, disabled controls, backgrounds and borders. Existing ramp
  generators produce isolated palettes with no connection to a token system.
  Audience: Design-systems leads who maintain a colour token file.
  Done: A perceptually even OKLCH ramp, contrast-checked, saved into the shared
  token schema and exportable as CSS variables, Tailwind config or DTCG JSON.

  NOT "just another generator": the ramp writes directly into a shared token
  schema that other Vantra tools read from — the focus-ring generator and
  dark-mode previewer consume these primitives. No other free ramp tool does
  this.
-->
<script setup lang="ts">
import { bestTextOn, formatRatio } from '~/utils/tools/color'
import { generateOklchRamp, rampToTokenPrimitives } from '~/utils/tools/oklch'
import { colorPrimitivesToCss, colorPrimitivesToTailwind, schemaToDtcg } from '~/utils/tools/export'
import { BRAND_PRIMARY, COLOR_TOKENS } from '~/utils/tools/tokens'
import type { Chip } from '~/types/tools'

useToolPageSeo({
  slug: 'color-ramp-generator',
  title: 'Color Ramp Generator',
  description:
    'Generate a perceptually even OKLCH colour ramp from one brand colour, with WCAG contrast checked at every step. Saves directly into the shared token schema.',
})

const { saveRamp, exportSchema } = useTokenSchema()
const { copy } = useCopyToClipboard()
const { push } = useToast()

const source = ref(BRAND_PRIMARY)
const rampName = ref('brand')

const ramp = computed(() => generateOklchRamp(source.value))
const primitives = computed(() => rampToTokenPrimitives(ramp.value))

const chips: Chip[] = COLOR_TOKENS.filter((t) => !['Paper', 'White'].includes(t.name)).map(
  (token) => ({
    value: token.hex,
    label: token.name,
    swatch: token.hex,
    description: token.hex,
  }),
)

// ── Export formats ──────────────────────────────────────────────────────────

const cssOutput = computed(() =>
  colorPrimitivesToCss(primitives.value, `--color-${rampName.value}`),
)

const tailwindOutput = computed(() =>
  colorPrimitivesToTailwind(primitives.value, rampName.value),
)

const dtcgOutput = computed(() => {
  const schema = exportSchema()
  return schemaToDtcg(schema)
})

// ── Save to schema ─────────────────────────────────────────────────────────

const saved = ref(false)

function saveToSchema() {
  saveRamp({
    source: source.value,
    name: rampName.value,
    steps: primitives.value,
  })
  saved.value = true
  push(`Ramp "${rampName.value}" saved to token schema`)
  setTimeout(() => { saved.value = false }, 2000)
}

// ── Copy step ──────────────────────────────────────────────────────────────

const flashed = ref<number | null>(null)

async function copyStep(step: number, hex: string) {
  const ok = await copy(hex, `${hex} copied`)
  if (!ok) return
  flashed.value = step
  window.setTimeout(() => {
    if (flashed.value === step) flashed.value = null
  }, 600)
}

// ── Export mode ─────────────────────────────────────────────────────────────

const exportMode = ref<'css' | 'tailwind' | 'dtcg'>('css')

const currentExport = computed(() => {
  if (exportMode.value === 'tailwind') return tailwindOutput.value
  if (exportMode.value === 'dtcg') return dtcgOutput.value
  return cssOutput.value
})

const exportLabel = computed(() => {
  if (exportMode.value === 'tailwind') return 'Tailwind config'
  if (exportMode.value === 'dtcg') return 'DTCG JSON'
  return 'CSS custom properties'
})

// ── Status text ────────────────────────────────────────────────────────────

const statusText = computed(() => {
  const passing = ramp.value.filter(
    (s) => s.contrastOnWhite >= 4.5 || s.contrastOnBlack >= 4.5,
  ).length
  return `${ramp.value.length}-step ramp from ${source.value}. ${passing} of ${ramp.value.length} steps pass AA normal against white or black.`
})
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 12"
      cover-line="A brand is one colour. A system needs eleven."
      lead="An OKLCH ramp holds the hue while spacing lightness perceptually, so step 300 looks as far from 200 as 700 does from 600 — which HSL cannot guarantee. Every step arrives with its WCAG contrast already measured, and the whole ramp writes directly into the shared token schema that the rest of these tools read from."
    />

    <section aria-labelledby="source-heading" class="gutter mt-20 md:mt-28">
      <h2 id="source-heading" class="caption">Source colour</h2>

      <div class="mt-8 md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-4">
          <ColorPickerField
            v-model="source"
            label="Base hex"
            hint="The midpoint the ramp is built around. Defaults to the Vantra primary."
          />

          <div class="mt-8">
            <ToolField
              v-model="rampName"
              label="Token name"
              hint="Used as the prefix in exported tokens, e.g. --color-brand-500."
            />
          </div>
        </div>

        <div class="mt-10 md:col-span-7 md:col-start-6 md:mt-0">
          <ToolChipRail v-model="source" label="Palette presets" :chips="chips" />

          <div class="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              class="caption inline-flex min-h-11 items-center gap-2 border px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial"
              :class="saved
                ? 'border-pass bg-pass text-paper'
                : 'border-ink bg-ink text-paper hover:bg-blue hover:border-blue'"
              @click="saveToSchema"
            >
              <span aria-hidden="true">{{ saved ? '✓' : '↓' }}</span>
              {{ saved ? 'Saved to schema' : 'Save to token schema' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="ramp-heading" class="gutter mt-section">
      <h2 id="ramp-heading" class="caption">The ramp</h2>
      <p class="caption mt-3 normal-case tracking-normal text-ink-muted">
        Select a step to copy its hex. Badges show WCAG contrast against white and black.
      </p>

      <!-- Empty state -->
      <div v-if="ramp.length === 0" class="mt-10 border border-rule p-12 text-center">
        <p class="font-display text-title text-ink-muted">No ramp to show.</p>
        <p class="mt-4 text-ink-faint">Enter a valid hex colour above to generate your ramp.</p>
      </div>

      <ul v-else class="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <li v-for="step in ramp" :key="step.step">
          <button
            type="button"
            class="block w-full text-left transition-transform duration-300 ease-editorial"
            :class="flashed === step.step ? 'scale-[1.03]' : ''"
            :aria-label="`Copy ${step.hex}, step ${step.step}`"
            @click="copyStep(step.step, step.hex)"
          >
            <span
              class="flex aspect-4/5 items-end p-4 transition-shadow duration-200"
              :class="flashed === step.step ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper' : ''"
              :style="{ backgroundColor: step.hex, color: bestTextOn(step.hex) }"
            >
              <span class="caption normal-case tracking-normal">
                {{ flashed === step.step ? 'Copied' : step.hex }}
              </span>
            </span>

            <span class="mt-3 flex items-baseline justify-between gap-3">
              <span class="caption text-ink">{{ step.step }}</span>
              <span class="caption tabular-nums text-ink-muted">
                <span :class="step.contrastOnWhite >= 4.5 ? 'text-pass' : 'text-ink-faint'">
                  W {{ formatRatio(step.contrastOnWhite) }}
                </span>
                <span class="ml-2" :class="step.contrastOnBlack >= 4.5 ? 'text-pass' : 'text-ink-faint'">
                  B {{ formatRatio(step.contrastOnBlack) }}
                </span>
              </span>
            </span>
          </button>
        </li>
      </ul>

      <p v-if="ramp.length > 0" class="caption mt-8 normal-case tracking-normal text-ink-muted">
        W is contrast against white, B against black. Steps marked in the pass tone clear 4.5:1
        (AA normal text).
      </p>
    </section>

    <section aria-labelledby="export-heading" class="gutter mt-section">
      <h2 id="export-heading" class="caption">Export</h2>

      <div class="mt-6 mb-6">
        <ToolToggle
          v-model="exportMode"
          label="Export format"
          :options="[
            { value: 'css', label: 'CSS' },
            { value: 'tailwind', label: 'Tailwind' },
            { value: 'dtcg', label: 'DTCG' },
          ]"
        />
      </div>

      <CodeBlock
        :code="currentExport"
        :label="exportLabel"
        :copy-label="`Copy ${exportLabel}`"
        :message="`${exportLabel} copied`"
      />
    </section>

    <ToolStatus :text="statusText" />

    <ToolReference slug="color-ramp-generator" />

    <ToolFooterNav slug="color-ramp-generator" />
  </div>
</template>
