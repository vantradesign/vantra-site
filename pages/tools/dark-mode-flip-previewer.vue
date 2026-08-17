<!--
  PM FRAMING
  Problem: Dark-mode palette generators are oversaturated — a dozen+ near-identical
  tools exist. What none of them do is operate on tokens you already defined.
  Designers have a light palette; they need to see their own tokens flipped to
  dark, not generate a new palette from scratch.
  Audience: Design-systems leads who maintain a light/dark token file.
  Done: A side-by-side preview of light vs. dark using the shared token schema's
  own primitives, with contrast validation and export as a dark theme layer.

  NOT "just another generator": this explicitly only operates on tokens already in
  the shared schema. It is "preview my own system in dark mode," not "generate a
  dark palette from scratch." That framing is the differentiator.
-->
<script setup lang="ts">
import { contrastRatio, formatRatio, relativeLuminance } from '~/utils/tools/color'
import { hexToOklch, oklchToHex } from '~/utils/tools/oklch'
import { darkModeToCss } from '~/utils/tools/export'

useToolPageSeo({
  slug: 'dark-mode-flip-previewer',
  title: 'Dark Mode Flip Previewer',
  description:
    'Preview your light-mode token schema flipped to dark. Contrast validation per pair. Export as a dark theme layer in CSS.',
})

const { schema, getColorPrimitives, setDarkModeMapping } = useTokenSchema()
const { push } = useToast()

// ── Read light-mode primitives from schema ─────────────────────────────────

const lightPrimitives = computed(() => {
  const prims = getColorPrimitives()
  return Object.entries(prims).map(([key, token]) => ({
    key,
    lightHex: token.$value,
  }))
})

const hasTokens = computed(() => lightPrimitives.value.length > 0)

// ── Auto-generate dark counterparts ────────────────────────────────────────

interface DarkPair {
  key: string
  lightHex: string
  darkHex: string
  lightLuminance: number
  darkLuminance: number
  contrast: number
}

/**
 * Flip a colour to its dark-mode counterpart by inverting lightness in OKLCH
 * while keeping hue and chroma. This produces a perceptually reasonable flip.
 */
function flipToDark(hex: string): string {
  const oklch = hexToOklch(hex)
  if (!oklch) return hex

  // Invert lightness: 0.95 → 0.05, 0.1 → 0.9, etc.
  // But clamp to avoid pure black/white
  const flippedL = Math.max(0.06, Math.min(0.94, 1 - oklch.l))

  // Reduce chroma slightly for dark mode to avoid oversaturation on dark backgrounds
  const flippedC = oklch.c * 0.85

  return oklchToHex({ l: flippedL, c: flippedC, h: oklch.h })
}

const darkPairs = ref<DarkPair[]>([])

function generateDarkPairs() {
  darkPairs.value = lightPrimitives.value.map(({ key, lightHex }) => {
    const darkHex = flipToDark(lightHex)
    return {
      key,
      lightHex,
      darkHex,
      lightLuminance: relativeLuminance(lightHex),
      darkLuminance: relativeLuminance(darkHex),
      contrast: contrastRatio(lightHex, darkHex),
    }
  })
}

// Auto-generate on mount if tokens exist
onMounted(() => {
  if (hasTokens.value) generateDarkPairs()
})

watch(hasTokens, (has) => {
  if (has && darkPairs.value.length === 0) generateDarkPairs()
})

// Allow manual editing of dark values
function updateDarkHex(index: number, hex: string) {
  const pair = darkPairs.value[index]
  if (!pair) return
  pair.darkHex = hex
  pair.contrast = contrastRatio(pair.lightHex, hex)
  pair.darkLuminance = relativeLuminance(hex)
}

// ── Sample UI for preview ──────────────────────────────────────────────────

function resolveColor(pairs: DarkPair[], key: string, mode: 'light' | 'dark'): string {
  const pair = pairs.find((p) => p.key === key)
  if (!pair) return '#888888'
  return mode === 'light' ? pair.lightHex : pair.darkHex
}

// ── Export ──────────────────────────────────────────────────────────────────

const darkMapping = computed(() => {
  const mapping: Record<string, string> = {}
  for (const pair of darkPairs.value) {
    mapping[pair.key] = pair.darkHex
  }
  return mapping
})

const cssOutput = computed(() => {
  const prims = getColorPrimitives()
  return darkModeToCss(prims, darkMapping.value)
})

// ── Save to schema ─────────────────────────────────────────────────────────

const saved = ref(false)

function saveToSchema() {
  setDarkModeMapping(darkMapping.value)
  saved.value = true
  push('Dark-mode layer saved to token schema')
  setTimeout(() => { saved.value = false }, 2000)
}

// ── Status ─────────────────────────────────────────────────────────────────

const statusText = computed(() => {
  if (darkPairs.value.length === 0) return 'No tokens in the schema. Add colours with another tool first.'
  const lowContrast = darkPairs.value.filter((p) => p.contrast < 3).length
  return `${darkPairs.value.length} tokens flipped.${lowContrast > 0 ? ` ${lowContrast} pair${lowContrast > 1 ? 's' : ''} below 3:1 contrast.` : ' All pairs above 3:1.'}`
})
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 17"
      cover-line="Dark mode is not an inversion. It is a second opinion on your own palette."
      lead="A dozen standalone dark-palette generators exist, and none of them know your tokens. This tool reads the colours already in your schema, flips their lightness in OKLCH, validates contrast per pair, and exports the result as a dark theme layer. Your system, previewed — not a new palette conjured from nothing."
    />

    <!-- Empty state -->
    <section v-if="!hasTokens" class="gutter mt-20 md:mt-28">
      <div class="border border-rule p-12 text-center">
        <p class="font-display text-title text-ink-muted">No tokens in the schema yet.</p>
        <p class="mt-4 text-ink-faint measure mx-auto">
          This tool operates on your own token schema. Use the Color Ramp Generator or
          Contrast Checker to add colour primitives first, then come back here to preview
          them in dark mode.
        </p>
        <p class="mt-6">
          <NuxtLink
            to="/tools/color-ramp-generator"
            class="caption inline-flex min-h-11 items-center gap-2 border border-ink bg-ink px-4 normal-case tracking-normal text-paper transition-colors duration-200 ease-editorial hover:bg-blue hover:border-blue"
          >
            Go to Color Ramp Generator
          </NuxtLink>
        </p>
      </div>
    </section>

    <template v-else>
      <!-- Token pairs table -->
      <section aria-labelledby="pairs-heading" class="gutter mt-20 md:mt-28">
        <h2 id="pairs-heading" class="caption">Token pairs</h2>
        <p class="caption mt-3 normal-case tracking-normal text-ink-muted">
          Each light token is flipped by inverting its OKLCH lightness. Edit the dark hex
          to fine-tune.
        </p>

        <div class="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            class="caption inline-flex min-h-11 items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink"
            @click="generateDarkPairs"
          >
            Regenerate from schema
          </button>
        </div>

        <div class="mt-8 overflow-x-auto">
          <table class="w-full text-left text-body">
            <thead>
              <tr class="border-b border-ink">
                <th class="caption py-3 pr-6 font-normal">Token</th>
                <th class="caption py-3 pr-6 font-normal">Light</th>
                <th class="caption py-3 pr-6 font-normal">Dark</th>
                <th class="caption py-3 pr-6 font-normal">Contrast</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(pair, i) in darkPairs"
                :key="pair.key"
                class="border-b border-rule"
              >
                <td class="py-3 pr-6 font-mono text-[0.875rem]">{{ pair.key }}</td>
                <td class="py-3 pr-6">
                  <span class="inline-flex items-center gap-2">
                    <span
                      class="inline-block h-5 w-5 shrink-0 border border-rule"
                      :style="{ backgroundColor: pair.lightHex }"
                    />
                    <span class="tabular-nums text-ink-muted">{{ pair.lightHex }}</span>
                  </span>
                </td>
                <td class="py-3 pr-6">
                  <span class="inline-flex items-center gap-2">
                    <span
                      class="inline-block h-5 w-5 shrink-0 border border-rule"
                      :style="{ backgroundColor: pair.darkHex }"
                    />
                    <input
                      :value="pair.darkHex"
                      type="text"
                      class="w-20 appearance-none border-b border-rule bg-transparent py-0.5 font-mono text-[0.875rem] tabular-nums text-ink outline-none transition-colors duration-200 ease-editorial focus:border-ink"
                      @change="updateDarkHex(i, ($event.target as HTMLInputElement).value)"
                    />
                  </span>
                </td>
                <td class="py-3 pr-6 tabular-nums">
                  <span :class="pair.contrast >= 3 ? 'text-pass' : 'text-fail'">
                    {{ formatRatio(pair.contrast) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Side-by-side preview -->
      <section aria-labelledby="preview-heading" class="gutter mt-section">
        <h2 id="preview-heading" class="caption">Side-by-side preview</h2>

        <div class="mt-8 grid gap-6 md:grid-cols-2">
          <!-- Light preview -->
          <div>
            <p class="caption mb-3">Light</p>
            <div
              class="min-h-48 p-8 transition-colors duration-200"
              :style="{
                backgroundColor: resolveColor(darkPairs, 'paper', 'light') !== '#888888'
                  ? resolveColor(darkPairs, 'paper', 'light')
                  : darkPairs[0]?.lightHex ?? '#f5f2f3',
                color: resolveColor(darkPairs, 'ink', 'light') !== '#888888'
                  ? resolveColor(darkPairs, 'ink', 'light')
                  : darkPairs[1]?.lightHex ?? '#001619',
              }"
            >
              <p class="font-display text-title">Headline</p>
              <p class="mt-3 text-body opacity-70">
                Body copy in the light theme. Compare this with the dark preview
                beside it.
              </p>
              <div class="mt-6 flex gap-3">
                <span
                  class="inline-flex min-h-9 items-center px-4 text-[0.875rem]"
                  :style="{
                    backgroundColor: resolveColor(darkPairs, 'blue', 'light') !== '#888888'
                      ? resolveColor(darkPairs, 'blue', 'light')
                      : '#021f94',
                    color: '#f5f2f3',
                  }"
                >
                  Primary
                </span>
                <span
                  class="inline-flex min-h-9 items-center border px-4 text-[0.875rem]"
                  style="border-color: currentColor"
                >
                  Secondary
                </span>
              </div>
            </div>
          </div>

          <!-- Dark preview -->
          <div>
            <p class="caption mb-3">Dark</p>
            <div
              class="min-h-48 p-8 transition-colors duration-200"
              :style="{
                backgroundColor: resolveColor(darkPairs, 'paper', 'dark') !== '#888888'
                  ? resolveColor(darkPairs, 'paper', 'dark')
                  : darkPairs[0]?.darkHex ?? '#1a1718',
                color: resolveColor(darkPairs, 'ink', 'dark') !== '#888888'
                  ? resolveColor(darkPairs, 'ink', 'dark')
                  : darkPairs[1]?.darkHex ?? '#e5e8e9',
              }"
            >
              <p class="font-display text-title">Headline</p>
              <p class="mt-3 text-body opacity-70">
                Body copy in the dark theme. Compare this with the light preview
                beside it.
              </p>
              <div class="mt-6 flex gap-3">
                <span
                  class="inline-flex min-h-9 items-center px-4 text-[0.875rem]"
                  :style="{
                    backgroundColor: resolveColor(darkPairs, 'blue', 'dark') !== '#888888'
                      ? resolveColor(darkPairs, 'blue', 'dark')
                      : '#6d80ff',
                    color: '#1a1718',
                  }"
                >
                  Primary
                </span>
                <span
                  class="inline-flex min-h-9 items-center border px-4 text-[0.875rem]"
                  style="border-color: currentColor"
                >
                  Secondary
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Export -->
      <section aria-labelledby="dark-export-heading" class="gutter mt-section">
        <h2 id="dark-export-heading" class="caption">Export</h2>

        <div class="mt-6 flex flex-wrap items-start gap-6">
          <button
            type="button"
            class="caption inline-flex min-h-11 items-center gap-2 border px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial"
            :class="saved
              ? 'border-pass bg-pass text-paper'
              : 'border-ink bg-ink text-paper hover:bg-blue hover:border-blue'"
            @click="saveToSchema"
          >
            <span aria-hidden="true">{{ saved ? '✓' : '↓' }}</span>
            {{ saved ? 'Saved' : 'Save dark layer to schema' }}
          </button>
        </div>

        <div class="mt-6">
          <CodeBlock
            :code="cssOutput"
            label="CSS dark-mode layer"
            copy-label="Copy CSS"
            message="Dark-mode CSS copied"
          />
        </div>
      </section>
    </template>

    <ToolStatus :text="statusText" />

    <ToolReference slug="dark-mode-flip-previewer" />

    <ToolFooterNav slug="dark-mode-flip-previewer" />
  </div>
</template>
