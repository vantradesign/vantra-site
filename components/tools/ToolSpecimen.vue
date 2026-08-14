<script setup lang="ts">
import type { ToolSpecimen } from '~/data/tools'

/**
 * The tile that stands in for a utility on the home-page shelf.
 *
 * Drawn in SVG rather than photographed, for the same reason product pages
 * refuse AI imagery: a screenshot of a calculator is not worth the bytes, and a
 * fabricated one would misrepresent it. Each drawing shows the *output shape* of
 * the tool — a ramp, a curve, a scale — so the shelf reads as a set of goods
 * without pretending to be a screenshot of anything.
 *
 * Purely decorative: the tile is aria-hidden and every tile sits inside a link
 * that already carries the tool's name.
 */
const props = withDefaults(
  defineProps<{ specimen: ToolSpecimen; accent?: 'blue' | 'cyan' }>(),
  { accent: 'cyan' },
)

const accentColor = computed(() =>
  props.accent === 'cyan' ? 'var(--color-cyan)' : 'var(--color-blue)',
)

/** Ten steps, drawn as opacity so the ramp survives a palette change. */
const rampSteps = Array.from({ length: 10 }, (_, i) => ({
  x: 6 + i * 8.8,
  opacity: 0.12 + i * 0.088,
}))

const stackSteps = [4, 6, 9, 13, 19, 27]
</script>

<template>
  <svg
    viewBox="0 0 100 100"
    class="h-full w-full"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Colour: a ten-step ramp. -->
    <g v-if="props.specimen === 'ramp'" class="fill-ink">
      <rect
        v-for="step in rampSteps"
        :key="step.x"
        :x="step.x"
        y="28"
        width="7"
        height="44"
        :opacity="step.opacity"
      />
    </g>

    <!-- Colour: two swatches measured against each other. -->
    <g v-else-if="props.specimen === 'swatches'">
      <rect x="10" y="22" width="42" height="42" class="fill-ink" />
      <rect x="48" y="36" width="42" height="42" :style="{ fill: accentColor }" />
      <line
        x1="10"
        y1="84"
        x2="90"
        y2="84"
        class="stroke-ink"
        stroke-width="1"
        opacity="0.35"
      />
    </g>

    <!-- Layout: three frames on one baseline. -->
    <g
      v-else-if="props.specimen === 'frame'"
      fill="none"
      class="stroke-ink"
      stroke-width="1.25"
    >
      <rect x="10" y="34" width="34" height="52" opacity="0.35" />
      <rect x="10" y="46" width="56" height="40" opacity="0.6" />
      <rect x="10" y="58" width="80" height="28" :style="{ stroke: accentColor }" />
    </g>

    <!-- Type: two faces, one baseline. -->
    <g v-else-if="props.specimen === 'pair'" class="fill-ink">
      <text x="8" y="68" class="font-display" font-size="30" font-weight="700">Aa</text>
      <text x="56" y="68" class="font-sans" font-size="20">Aa</text>
      <line
        x1="10"
        y1="76"
        x2="90"
        y2="76"
        :style="{ stroke: accentColor }"
        stroke-width="1.25"
        opacity="0.9"
      />
    </g>

    <!-- Type: a modular scale, four steps. -->
    <g v-else-if="props.specimen === 'scale'" class="fill-ink">
      <rect x="10" y="18" width="62" height="12" />
      <rect x="10" y="36" width="46" height="9" opacity="0.75" />
      <rect x="10" y="51" width="34" height="7" opacity="0.55" />
      <rect x="10" y="64" width="24" height="5" opacity="0.4" />
      <rect x="10" y="75" width="16" height="4" :style="{ fill: accentColor }" />
    </g>

    <!-- Layout: a spacing stack, drawn to proportion. -->
    <g v-else-if="props.specimen === 'stack'">
      <template v-for="(height, i) in stackSteps" :key="i">
        <rect
          :x="10 + i * 14"
          :y="80 - height"
          width="9"
          :height="height"
          :style="{ fill: i === stackSteps.length - 1 ? accentColor : 'var(--color-ink)' }"
          :opacity="i === stackSteps.length - 1 ? 1 : 0.25 + i * 0.12"
        />
      </template>
      <line x1="10" y1="80" x2="90" y2="80" class="stroke-ink" stroke-width="1" />
    </g>

    <!-- Motion: a cubic-bezier with its handles. -->
    <g v-else-if="props.specimen === 'curve'" fill="none">
      <path d="M14 82 H86" class="stroke-ink" stroke-width="1" opacity="0.3" />
      <path d="M14 82 V18" class="stroke-ink" stroke-width="1" opacity="0.3" />
      <path d="M14 82 C34 82 46 18 86 18" :style="{ stroke: accentColor }" stroke-width="2.5" />
      <path
        d="M14 82 L34 82 M86 18 L46 18"
        class="stroke-ink"
        stroke-width="1"
        opacity="0.45"
      />
      <circle cx="34" cy="82" r="2.5" class="fill-ink" />
      <circle cx="46" cy="18" r="2.5" class="fill-ink" />
    </g>

    <!-- Units: the same measurement, twice. -->
    <g v-else-if="props.specimen === 'numerals'" class="fill-ink">
      <text x="10" y="48" class="font-display" font-size="26" font-weight="700">
        16px
      </text>
      <text x="10" y="80" class="font-display" font-size="26" font-weight="700">
        1rem
      </text>
      <line x1="10" y1="58" x2="90" y2="58" :style="{ stroke: accentColor }" stroke-width="1.25" />
    </g>

    <!-- Layout: a radius and its shadow. -->
    <g v-else-if="props.specimen === 'card'">
      <rect x="24" y="34" width="58" height="46" rx="10" class="fill-ink" opacity="0.12" />
      <rect x="20" y="28" width="58" height="46" rx="10" class="fill-ink" opacity="0.22" />
      <rect
        x="16"
        y="22"
        width="58"
        height="46"
        rx="10"
        fill="none"
        :style="{ stroke: accentColor }"
        stroke-width="2"
      />
    </g>

    <!-- Layout: named regions, one of them spanning two rows. -->
    <g v-else-if="props.specimen === 'regions'">
      <rect x="10" y="20" width="80" height="14" class="fill-ink" opacity="0.22" />
      <rect x="10" y="38" width="24" height="42" class="fill-ink" opacity="0.35" />
      <rect
        x="38"
        y="38"
        width="52"
        height="42"
        fill="none"
        :style="{ stroke: accentColor }"
        stroke-width="2"
      />
      <line x1="38" y1="60" x2="90" y2="60" class="stroke-ink" stroke-width="1" opacity="0.3" />
      <line x1="64" y1="38" x2="64" y2="80" class="stroke-ink" stroke-width="1" opacity="0.3" />
    </g>

    <!-- Units: one value, sloping between two viewports. -->
    <g v-else-if="props.specimen === 'fluid'">
      <line x1="12" y1="24" x2="12" y2="86" class="stroke-ink" stroke-width="1" opacity="0.3" />
      <line x1="88" y1="24" x2="88" y2="86" class="stroke-ink" stroke-width="1" opacity="0.3" />
      <path d="M12 70 H32 L68 34 H88" fill="none" :style="{ stroke: accentColor }" stroke-width="2.5" />
      <circle cx="32" cy="70" r="2.5" class="fill-ink" />
      <circle cx="68" cy="34" r="2.5" class="fill-ink" />
    </g>
  </svg>
</template>
