<script setup lang="ts">
import {
  ASPECT_PRESETS,
  ASPECT_REFERENCE,
  formatRatioNotation,
  nameForRatio,
  reduceRatio,
} from '~/utils/tools/ratio'
import type { Chip } from '~/types/tools'
import type { MoodImage } from '~/types/product'

useSeoMeta({
  title: 'Aspect Ratio Calculator',
  description:
    'Ratio to dimension, dimension to ratio, and proportional resize — with a live preview and a printable reference table.',
})

const crop: MoodImage = {
  src: '/editorial/10-studio-detail.avif',
  alt: 'A studio desk detail in daylight, cropped to a wide editorial frame.',
  focal: '50% 45%',
  placeholder: true,
}

const chips: Chip[] = ASPECT_PRESETS.map((preset) => ({
  value: preset.label,
  label: preset.label,
}))

const preset = ref<string>('16:9')

/* Mode 1 — ratio to dimension. */
const ratioW = ref('16')
const ratioH = ref('9')
const knownWidth = ref('1440')

/* Mode 2 — dimension to ratio. */
const measuredWidth = ref('1920')
const measuredHeight = ref('1080')

/* Mode 3 — proportional resize. */
const sourceWidth = ref('1920')
const sourceHeight = ref('1080')
const targetWidth = ref('1200')

function positive(value: string): number | null {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

const ratioError = computed(() =>
  positive(ratioW.value) && positive(ratioH.value)
    ? undefined
    : 'Both sides of the ratio must be greater than zero.',
)
const widthError = computed(() =>
  positive(knownWidth.value) ? undefined : 'Width must be greater than zero.',
)

const derivedHeight = computed(() => {
  const w = positive(ratioW.value)
  const h = positive(ratioH.value)
  const width = positive(knownWidth.value)
  if (!w || !h || !width) return null
  return Math.round((width * h) / w)
})

const measuredError = computed(() =>
  positive(measuredWidth.value) && positive(measuredHeight.value)
    ? undefined
    : 'Both dimensions must be greater than zero.',
)

const measuredRatio = computed(() => {
  const w = positive(measuredWidth.value)
  const h = positive(measuredHeight.value)
  if (!w || !h) return null
  return reduceRatio(w, h)
})

const measuredName = computed(() => {
  const w = positive(measuredWidth.value)
  const h = positive(measuredHeight.value)
  return w && h ? nameForRatio(w, h) : null
})

const resizeError = computed(() =>
  positive(sourceWidth.value) && positive(sourceHeight.value) && positive(targetWidth.value)
    ? undefined
    : 'Source and target values must be greater than zero.',
)

const resizedHeight = computed(() => {
  const sw = positive(sourceWidth.value)
  const sh = positive(sourceHeight.value)
  const tw = positive(targetWidth.value)
  if (!sw || !sh || !tw) return null
  return Math.round((tw * sh) / sw)
})

/* The preview always follows the ratio in mode 1: it is the mode the presets
   drive, so the rail, the numbers and the rectangle never disagree. */
const previewRatio = computed(() => {
  const w = positive(ratioW.value) ?? 16
  const h = positive(ratioH.value) ?? 9
  return `${w} / ${h}`
})

const previewName = computed(() => {
  const w = positive(ratioW.value)
  const h = positive(ratioH.value)
  return w && h ? nameForRatio(w, h) : 'Custom'
})

watch(preset, (label) => {
  const match = ASPECT_PRESETS.find((entry) => entry.label === label)
  if (!match) return
  ratioW.value = String(match.w)
  ratioH.value = String(match.h)
})

watch([ratioW, ratioH], () => {
  const w = positive(ratioW.value)
  const h = positive(ratioH.value)
  const match =
    w && h ? ASPECT_PRESETS.find((entry) => entry.w === w && entry.h === h)?.label : undefined
  preset.value = match ?? ''
})

const ratioResult = computed(() => {
  const w = positive(ratioW.value)
  const h = positive(ratioH.value)
  const width = positive(knownWidth.value)
  if (!w || !h || !width || derivedHeight.value === null) return null

  return [
    `${Math.round(width)} × ${derivedHeight.value} px`,
    `${formatRatioNotation(reduceRatio(w, h))} — ${previewName.value}`,
    `aspect-ratio: ${w} / ${h};`,
  ].join('\n')
})

const measuredResult = computed(() => {
  if (!measuredRatio.value || !measuredName.value) return null
  const w = positive(measuredWidth.value)!
  const h = positive(measuredHeight.value)!

  return [
    `${formatRatioNotation(measuredRatio.value)} — ${measuredName.value}`,
    `${Math.round(w)} × ${Math.round(h)} px`,
    `aspect-ratio: ${measuredRatio.value.w} / ${measuredRatio.value.h};`,
  ].join('\n')
})

const resizeResult = computed(() => {
  if (resizedHeight.value === null) return null
  const tw = positive(targetWidth.value)!
  const sw = positive(sourceWidth.value)!

  return [
    `${Math.round(tw)} × ${resizedHeight.value} px`,
    `scale: ${(tw / sw).toFixed(3)}×`,
  ].join('\n')
})
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 02"
      cover-line="A frame decides what the picture is about."
      lead="The same photograph reads as reportage at 3:2, as fashion at 4:5, and as cinema at 21:9. Choosing a ratio is an editorial decision that happens to require arithmetic — so here is the arithmetic, in three directions."
    />

    <figure class="gutter mt-16">
      <div class="relative overflow-hidden" :style="{ aspectRatio: previewRatio }">
        <MoodImage :image="crop" sizes="100vw" />
      </div>
      <figcaption class="pt-4">
        <EditorialCaption
          :index="previewName"
          :text="`The same crop, held at ${formatRatioNotation(reduceRatio(Number(ratioW) || 16, Number(ratioH) || 9))}. Change the ratio below and this frame follows.`"
        />
      </figcaption>
    </figure>

    <section aria-labelledby="calculators-heading" class="gutter mt-20 md:mt-28">
      <h2 id="calculators-heading" class="caption">The three calculations</h2>

      <div class="mt-8">
        <ToolChipRail v-model="preset" label="Platform presets" :chips="chips" />
      </div>

      <div class="mt-14 grid gap-14 md:grid-cols-3 md:gap-x-8">
        <ToolPanel label="Ratio → dimension" note="You know the shape and one side.">
          <div class="space-y-8">
            <div class="grid grid-cols-2 gap-4">
              <ToolField
                v-model="ratioW"
                label="Ratio width"
                type="number"
                inputmode="numeric"
                :min="1"
                :error="ratioError"
              />
              <ToolField
                v-model="ratioH"
                label="Ratio height"
                type="number"
                inputmode="numeric"
                :min="1"
              />
            </div>

            <ToolField
              v-model="knownWidth"
              label="Known width"
              type="number"
              inputmode="numeric"
              :min="1"
              suffix="px"
              :error="widthError"
            />

            <p class="font-display text-title tabular-nums" aria-live="polite">
              {{ derivedHeight === null ? '—' : `${derivedHeight} px high` }}
            </p>

            <CodeBlock
              v-if="ratioResult"
              :code="ratioResult"
              label="Result"
              copy-label="Copy result"
            />
          </div>
        </ToolPanel>

        <ToolPanel label="Dimension → ratio" note="You have pixels and need the notation.">
          <div class="space-y-8">
            <ToolField
              v-model="measuredWidth"
              label="Width"
              type="number"
              inputmode="numeric"
              :min="1"
              suffix="px"
              :error="measuredError"
            />
            <ToolField
              v-model="measuredHeight"
              label="Height"
              type="number"
              inputmode="numeric"
              :min="1"
              suffix="px"
            />

            <p class="font-display text-title tabular-nums" aria-live="polite">
              {{ measuredRatio ? formatRatioNotation(measuredRatio) : '—' }}
              <span v-if="measuredName" class="caption ml-3 text-ink-muted">
                {{ measuredName }}
              </span>
            </p>

            <CodeBlock
              v-if="measuredResult"
              :code="measuredResult"
              label="Result"
              copy-label="Copy result"
            />
          </div>
        </ToolPanel>

        <ToolPanel label="Resize" note="Keep the proportion, change the size.">
          <div class="space-y-8">
            <div class="grid grid-cols-2 gap-4">
              <ToolField
                v-model="sourceWidth"
                label="Source width"
                type="number"
                inputmode="numeric"
                :min="1"
                :error="resizeError"
              />
              <ToolField
                v-model="sourceHeight"
                label="Source height"
                type="number"
                inputmode="numeric"
                :min="1"
              />
            </div>

            <ToolField
              v-model="targetWidth"
              label="Target width"
              type="number"
              inputmode="numeric"
              :min="1"
              suffix="px"
            />

            <p class="font-display text-title tabular-nums" aria-live="polite">
              {{ resizedHeight === null ? '—' : `${resizedHeight} px high` }}
            </p>

            <CodeBlock
              v-if="resizeResult"
              :code="resizeResult"
              label="Result"
              copy-label="Copy result"
            />
          </div>
        </ToolPanel>
      </div>
    </section>

    <section aria-labelledby="preview-heading" class="gutter mt-section">
      <h2 id="preview-heading" class="caption">Live proportion</h2>

      <div class="mt-8 border-t border-ink pt-10">
        <div
          class="ratio-preview mx-auto w-full max-w-3xl border border-ink"
          :style="{ aspectRatio: previewRatio }"
          role="img"
          :aria-label="`Rectangle at ratio ${ratioW} to ${ratioH}, ${previewName}`"
        >
          <p class="caption flex h-full items-end p-4 tabular-nums text-ink-muted">
            {{ ratioW }} : {{ ratioH }} — {{ previewName }}
          </p>
        </div>
      </div>
    </section>

    <section aria-labelledby="reference-heading" class="gutter mt-section">
      <h2 id="reference-heading" class="caption">Reference</h2>

      <table class="mt-8 w-full border-collapse text-left">
        <thead>
          <tr class="border-y border-ink">
            <th scope="col" class="caption py-4 pr-6 font-normal">Ratio</th>
            <th scope="col" class="caption py-4 pr-6 font-normal">Name</th>
            <th scope="col" class="caption py-4 pr-6 font-normal">Typical use</th>
            <th scope="col" class="caption py-4 font-normal">Example</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in ASPECT_REFERENCE" :key="entry.ratio" class="border-b border-rule">
            <td class="py-5 pr-6 font-display text-title tabular-nums">{{ entry.ratio }}</td>
            <td class="py-5 pr-6">{{ entry.name }}</td>
            <td class="py-5 pr-6 text-ink-muted">{{ entry.use }}</td>
            <td class="py-5 tabular-nums text-ink-muted">{{ entry.example }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <ToolFooterNav slug="aspect-ratio" />
  </div>
</template>

<style scoped>
/* A 12-column measure drawn straight onto the preview: it reads as a layout
   grid rather than as a chart, and costs no extra elements. */
.ratio-preview {
  background-image: repeating-linear-gradient(
      to right,
      color-mix(in oklab, var(--color-ink) 8%, transparent) 0 1px,
      transparent 1px calc(100% / 12)
    ),
    repeating-linear-gradient(
      to bottom,
      color-mix(in oklab, var(--color-ink) 8%, transparent) 0 1px,
      transparent 1px 3rem
    );
}
</style>
