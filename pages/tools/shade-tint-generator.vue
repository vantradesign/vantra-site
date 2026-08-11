<script setup lang="ts">
import { bestTextOn, formatRatio, generateRamp } from '~/utils/tools/color'
import { BRAND_PRIMARY, COLOR_TOKENS } from '~/utils/tools/tokens'
import type { Chip } from '~/types/tools'

useSeoMeta({
  title: 'Shade & Tint Generator',
  description:
    'Generate a ten-step colour ramp from one hex value, with contrast checked against white and black at every step, and a Tailwind config export.',
})

const source = ref(BRAND_PRIMARY)
const ramp = computed(() => generateRamp(source.value))

const chips: Chip[] = COLOR_TOKENS.filter((token) => !['Paper', 'White'].includes(token.name)).map(
  (token) => ({
    value: token.hex,
    label: token.name,
    swatch: token.hex,
    description: token.hex,
  }),
)

/** Step whose hex was copied last, used for the highlight pulse. */
const flashed = ref<number | null>(null)
const { copy } = useCopyToClipboard()

async function copyStep(step: number, hex: string) {
  const ok = await copy(hex, `${hex} copied`)
  if (!ok) return

  flashed.value = step
  window.setTimeout(() => {
    if (flashed.value === step) flashed.value = null
  }, 600)
}

const tailwindConfig = computed(() =>
  [
    '// tailwind.config — colour ramp',
    'module.exports = {',
    '  theme: {',
    '    extend: {',
    '      colors: {',
    '        brand: {',
    ...ramp.value.map((step) => `          ${step.step}: '${step.hex}',`),
    '        },',
    '      },',
    '    },',
    '  },',
    '}',
  ].join('\n'),
)

const cssVariables = computed(() =>
  [
    `/* Ramp from ${source.value} */`,
    ':root {',
    ...ramp.value.map((step) => `  --color-brand-${step.step}: ${step.hex};`),
    '}',
  ].join('\n'),
)
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 06"
      cover-line="One colour is never one colour."
      lead="A brand value on its own cannot carry a hover state, a disabled control and a background tint. A ramp can. These ten steps hold the hue, re-anchor the lightness, and ease the saturation at the pale end so the tints do not turn chalky — and each one arrives with its contrast already measured."
    />

    <section aria-labelledby="source-heading" class="gutter mt-20 md:mt-28">
      <h2 id="source-heading" class="caption">Source colour</h2>

      <div class="mt-8 md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-4">
          <ColorPickerField
            v-model="source"
            label="Base hex"
            hint="Defaults to the Vantra primary, --color-blue."
          />
        </div>

        <div class="mt-10 md:col-span-7 md:col-start-6 md:mt-0">
          <ToolChipRail v-model="source" label="Palette presets" :chips="chips" />

          <div class="mt-8 flex flex-wrap gap-4">
            <CopyButton
              :value="tailwindConfig"
              label="Export as Tailwind config"
              variant="solid"
              message="Tailwind config copied"
            />
            <CopyButton
              :value="cssVariables"
              label="Export as CSS variables"
              message="CSS custom properties copied"
            />
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="ramp-heading" class="gutter mt-section">
      <h2 id="ramp-heading" class="caption">The ramp</h2>
      <p class="caption mt-3 normal-case tracking-normal text-ink-muted">
        Select a field to copy its hex value. Badges show contrast against white and black.
      </p>

      <ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
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
                <span :class="step.onWhite >= 4.5 ? 'text-pass' : 'text-ink-faint'">
                  W {{ formatRatio(step.onWhite) }}
                </span>
                <span class="ml-2" :class="step.onBlack >= 4.5 ? 'text-pass' : 'text-ink-faint'">
                  B {{ formatRatio(step.onBlack) }}
                </span>
              </span>
            </span>
          </button>
        </li>
      </ul>

      <p class="caption mt-8 normal-case tracking-normal text-ink-muted">
        W is contrast against white, B against black. A value marked in the pass tone clears 4.5:1,
        so text of that colour is safe on that step.
      </p>
    </section>

    <section aria-labelledby="ramp-output-heading" class="gutter mt-section">
      <h2 id="ramp-output-heading" class="sr-only">Copy-ready output</h2>
      <CodeBlock :code="tailwindConfig" label="Tailwind config" copy-label="Copy config" />
    </section>

    <ToolFooterNav slug="shade-tint-generator" />
  </div>
</template>
