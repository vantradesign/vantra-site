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

    <!-- Colour: an OKLCH spectrum, eleven steps fanning from dark to light. -->
    <g v-else-if="props.specimen === 'spectrum'" class="fill-ink">
      <rect
        v-for="i in 11"
        :key="`sp-${i}`"
        :x="4 + (i - 1) * 8.4"
        y="24"
        width="6.5"
        height="52"
        :opacity="0.06 + i * 0.085"
      />
      <line x1="4" y1="82" x2="96" y2="82" :style="{ stroke: accentColor }" stroke-width="1.25" />
    </g>

    <!-- Layout: stacked translucent layers for z-index. -->
    <g v-else-if="props.specimen === 'layers'">
      <rect x="14" y="58" width="54" height="22" class="fill-ink" opacity="0.15" />
      <rect x="22" y="44" width="54" height="22" class="fill-ink" opacity="0.30" />
      <rect x="30" y="30" width="54" height="22" class="fill-ink" opacity="0.50" />
      <rect
        x="38"
        y="16"
        width="54"
        height="22"
        fill="none"
        :style="{ stroke: accentColor }"
        stroke-width="2"
      />
    </g>

    <!-- Layout: three device frames at different widths. -->
    <g
      v-else-if="props.specimen === 'devices'"
      fill="none"
      class="stroke-ink"
      stroke-width="1.25"
    >
      <rect x="8" y="28" width="18" height="56" rx="2" opacity="0.35" />
      <rect x="32" y="22" width="30" height="56" rx="2" opacity="0.55" />
      <rect
        x="68"
        y="16"
        width="26"
        height="56"
        rx="2"
        :style="{ stroke: accentColor }"
      />
    </g>

    <!-- Assets: a keyline grid with an icon shape inside. -->
    <g v-else-if="props.specimen === 'keyline'">
      <rect x="20" y="20" width="60" height="60" fill="none" class="stroke-ink" stroke-width="1" opacity="0.2" />
      <line x1="50" y1="20" x2="50" y2="80" class="stroke-ink" stroke-width="1" opacity="0.15" />
      <line x1="20" y1="50" x2="80" y2="50" class="stroke-ink" stroke-width="1" opacity="0.15" />
      <circle cx="50" cy="50" r="22" fill="none" class="stroke-ink" stroke-width="1" opacity="0.2" />
      <polygon
        points="50,30 38,58 62,58"
        fill="none"
        :style="{ stroke: accentColor }"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </g>

    <!-- Colour: concentric focus rings around a control. -->
    <g v-else-if="props.specimen === 'ring'">
      <rect x="30" y="38" width="40" height="24" rx="4" class="fill-ink" opacity="0.20" />
      <rect
        x="26"
        y="34"
        width="48"
        height="32"
        rx="6"
        fill="none"
        :style="{ stroke: accentColor }"
        stroke-width="2.5"
      />
      <rect x="22" y="30" width="56" height="40" rx="8" fill="none" class="stroke-ink" stroke-width="1" opacity="0.25" />
    </g>

    <!-- Colour: light/dark split preview. -->
    <g v-else-if="props.specimen === 'flip'">
      <rect x="10" y="20" width="38" height="60" class="fill-ink" opacity="0.08" />
      <rect x="14" y="30" width="30" height="6" class="fill-ink" opacity="0.40" />
      <rect x="14" y="40" width="22" height="4" class="fill-ink" opacity="0.25" />
      <rect x="52" y="20" width="38" height="60" class="fill-ink" />
      <rect x="56" y="30" width="30" height="6" :style="{ fill: accentColor }" />
      <rect x="56" y="40" width="22" height="4" fill="white" opacity="0.35" />
      <line x1="50" y1="16" x2="50" y2="84" class="stroke-ink" stroke-width="1" opacity="0.35" />
    </g>

    <!-- Content: empty-state layout (icon + lines). -->
    <g v-else-if="props.specimen === 'placeholder'">
      <circle cx="50" cy="34" r="10" fill="none" :style="{ stroke: accentColor }" stroke-width="2" />
      <line x1="50" y1="28" x2="50" y2="40" :style="{ stroke: accentColor }" stroke-width="2" />
      <circle cx="50" cy="42" r="1" :style="{ fill: accentColor }" />
      <rect x="28" y="54" width="44" height="5" class="fill-ink" opacity="0.30" />
      <rect x="34" y="63" width="32" height="4" class="fill-ink" opacity="0.18" />
      <rect x="38" y="74" width="24" height="7" rx="2" fill="none" class="stroke-ink" stroke-width="1" opacity="0.35" />
    </g>

    <!-- Governance: a four-axis radar chart with a polygon. -->
    <g v-else-if="props.specimen === 'radar'">
      <polygon points="50,18 82,50 50,82 18,50" fill="none" class="stroke-ink" stroke-width="1" opacity="0.2" />
      <polygon points="50,30 70,50 50,70 30,50" fill="none" class="stroke-ink" stroke-width="1" opacity="0.15" />
      <line x1="50" y1="18" x2="50" y2="82" class="stroke-ink" stroke-width="1" opacity="0.15" />
      <line x1="18" y1="50" x2="82" y2="50" class="stroke-ink" stroke-width="1" opacity="0.15" />
      <polygon
        points="50,24 74,50 50,68 26,50"
        fill="none"
        :style="{ stroke: accentColor }"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </g>

    <!-- Accessibility: a reading-order transcript, five numbered entries. -->
    <g v-else-if="props.specimen === 'transcript'">
      <circle cx="16" cy="24" r="2.5" class="fill-ink" opacity="0.30" />
      <rect x="24" y="22" width="48" height="4" class="fill-ink" opacity="0.20" />
      <circle cx="16" cy="38" r="2.5" class="fill-ink" opacity="0.40" />
      <rect x="24" y="36" width="40" height="4" class="fill-ink" opacity="0.30" />
      <circle cx="16" cy="52" r="2.5" :style="{ fill: accentColor }" />
      <rect x="24" y="50" width="56" height="4" :style="{ fill: accentColor }" />
      <circle cx="16" cy="66" r="2.5" class="fill-ink" opacity="0.40" />
      <rect x="24" y="64" width="36" height="4" class="fill-ink" opacity="0.30" />
      <circle cx="16" cy="80" r="2.5" class="fill-ink" opacity="0.30" />
      <rect x="24" y="78" width="28" height="4" class="fill-ink" opacity="0.20" />
    </g>
  </svg>
</template>
