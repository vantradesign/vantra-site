<script setup lang="ts">
import { contrastRatio, formatRatio, wcagVerdicts } from '~/utils/tools/color'
import { COLOR_TOKENS, tokenByHex } from '~/utils/tools/tokens'
import type { Chip } from '~/types/tools'

useToolPageSeo({
  slug: 'contrast-checker',
  title: 'Contrast Checker',
  description:
    'Check WCAG contrast between two colours, with the Vantra palette available as presets. Runs entirely in the browser.',
})

const foreground = ref('#001619')
const background = ref('#f5f2f3')

const ratio = computed(() => contrastRatio(foreground.value, background.value))
const verdicts = computed(() => wcagVerdicts(ratio.value))
const passCount = computed(() => verdicts.value.filter((verdict) => verdict.passes).length)

const chips = computed<Chip[]>(() =>
  COLOR_TOKENS.map((token) => ({
    value: token.hex,
    label: token.name,
    swatch: token.hex,
    description: token.hex,
  })),
)

const foregroundToken = computed(() => tokenByHex(foreground.value))
const backgroundToken = computed(() => tokenByHex(background.value))

function describe(hex: string) {
  const token = tokenByHex(hex)
  return token ? `${token.variable} (${hex})` : hex
}

const cssComment = computed(() =>
  [
    `/* Contrast ${formatRatio(ratio.value)}`,
    ` * foreground: ${describe(foreground.value)}`,
    ` * background: ${describe(background.value)}`,
    ...verdicts.value.map(
      (verdict) =>
        ` * ${verdict.label} (${verdict.threshold}:1): ${verdict.passes ? 'pass' : 'fail'}`,
    ),
    ' */',
    `color: ${foreground.value};`,
    `background-color: ${background.value};`,
  ].join('\n'),
)

function swap() {
  const previous = foreground.value
  foreground.value = background.value
  background.value = previous
}
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 01"
      cover-line="Contrast is the difference between a decision and an obstacle."
      lead="A ratio is not a formality. Below 4.5:1 a paragraph stops being readable for a large part of your audience, and nobody files a bug about it — they simply leave. This checks two colours against the WCAG thresholds, including the Vantra palette, and computes everything on your machine."
    />

    <section aria-labelledby="checker-heading" class="gutter mt-20 md:mt-28">
      <h2 id="checker-heading" class="sr-only">Contrast checker</h2>

      <div class="md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-6">
          <ToolChipRail
            v-model="foreground"
            label="Foreground preset"
            :chips="chips"
          />

          <div class="mt-8">
            <ColorPickerField
              v-model="foreground"
              label="Foreground"
              :hint="foregroundToken ? `Token ${foregroundToken.variable}` : 'Custom value'"
            />
          </div>

          <div class="mt-12">
            <ToolChipRail
              v-model="background"
              label="Background preset"
              :chips="chips"
            />
          </div>

          <div class="mt-8">
            <ColorPickerField
              v-model="background"
              label="Background"
              :hint="backgroundToken ? `Token ${backgroundToken.variable}` : 'Custom value'"
            />
          </div>

          <button
            type="button"
            class="caption mt-8 inline-flex min-h-11 items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink"
            @click="swap"
          >
            <span aria-hidden="true">⇅</span>
            Swap foreground and background
          </button>
        </div>

        <div class="mt-16 md:col-span-6 md:mt-0">
          <p class="caption mb-3">Preview</p>

          <div
            class="flex min-h-64 flex-col justify-between p-8 transition-colors duration-200 ease-editorial"
            :style="{ backgroundColor: background, color: foreground }"
          >
            <p class="font-display text-[5rem] leading-none" aria-hidden="true">Aa</p>
            <p class="mt-6 max-w-[34ch] text-body">
              Body copy at 17px. If this sentence takes effort to read, the ratio below is telling
              you the truth.
            </p>
          </div>

          <div class="mt-10 border-t border-ink pt-6">
            <p class="caption">Contrast ratio</p>
            <p class="mt-3 font-display text-cover leading-none tabular-nums" aria-live="polite">
              {{ formatRatio(ratio) }}
            </p>
            <p class="caption mt-4 normal-case tracking-normal text-ink-muted">
              {{ passCount }} of 3 thresholds met.
            </p>
          </div>

          <div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StatusBadge
              v-for="verdict in verdicts"
              :key="verdict.id"
              :passes="verdict.passes"
              :label="verdict.label"
              :detail="`${verdict.threshold}:1 — ${verdict.requirement}`"
            />
          </div>

          <div class="mt-12">
            <CodeBlock
              :code="cssComment"
              label="Copy-ready CSS"
              copy-label="Copy CSS"
              message="Contrast result copied as CSS"
            />
          </div>
        </div>
      </div>
    </section>

    <ToolReference slug="contrast-checker" />

    <ToolFooterNav slug="contrast-checker" />
  </div>
</template>
