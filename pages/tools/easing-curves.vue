<script setup lang="ts">
import { EASING_PRESETS, formatCubicBezier, matchPreset } from '~/utils/tools/easing'
import type { BezierPoints } from '~/utils/tools/easing'

useToolPageSeo({
  slug: 'easing-curves',
  title: 'Easing Curve Visualizer',
  description:
    'A cubic-bezier editor with draggable and keyboard-movable control points, presets, and a repeatable live preview.',
})

const points = ref<BezierPoints>({ x1: 0.2, y1: 0, x2: 0, y2: 1 })
const duration = ref(900)

const preset = computed({
  get: () => matchPreset(points.value)?.value ?? '',
  set: (value: string) => {
    const match = EASING_PRESETS.find((entry) => entry.value === value)
    if (match) points.value = { ...match.points }
  },
})

const timingFunction = computed(() => formatCubicBezier(points.value))

/**
 * [A11y] The timing function used to sit in its own `aria-live`, which announced
 * a bare `cubic-bezier(...)` string — four numbers with no indication of what had
 * changed. Dragging a handle fired one announcement per step.
 *
 * Naming the preset first gives the listener the useful part: whether they are
 * still on a known curve or have moved off it. ToolStatus debounces the rest.
 */
const statusText = computed(() => {
  const name = matchPreset(points.value)?.label ?? 'Custom curve'
  return `${name}. ${timingFunction.value}.`
})

/* Geometry. x maps 0–1 onto 0–100; y is inverted and allowed to overshoot
   between -0.5 and 1.5, which is where the interesting curves live. */
const X_MIN = 0
const X_MAX = 1
const Y_MIN = -0.5
const Y_MAX = 1.5

function toSvgX(x: number) {
  return x * 100
}

function toSvgY(y: number) {
  return (1 - y) * 100
}

const curvePath = computed(() => {
  const { x1, y1, x2, y2 } = points.value
  return `M 0 100 C ${toSvgX(x1)} ${toSvgY(y1)}, ${toSvgX(x2)} ${toSvgY(y2)}, 100 0`
})

const svg = ref<SVGSVGElement | null>(null)
const dragging = ref<'p1' | 'p2' | null>(null)

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function setHandle(handle: 'p1' | 'p2', x: number, y: number) {
  const next = { ...points.value }

  if (handle === 'p1') {
    next.x1 = clamp(x, X_MIN, X_MAX)
    next.y1 = clamp(y, Y_MIN, Y_MAX)
  } else {
    next.x2 = clamp(x, X_MIN, X_MAX)
    next.y2 = clamp(y, Y_MIN, Y_MAX)
  }

  points.value = next
}

function pointerToCurve(event: PointerEvent) {
  const element = svg.value
  if (!element) return null

  const box = element.getBoundingClientRect()
  /* viewBox is -4 -4 108 108. Map pixel position to SVG units, then to curve
     coordinates. The curve's x runs 0–100 in SVG, y runs 100 (bottom) to
     0 (top) mapped via toSvgY. */
  const svgX = -4 + ((event.clientX - box.left) / box.width) * 108
  const svgYCoord = -4 + ((event.clientY - box.top) / box.height) * 108

  const x = svgX / 100
  const y = 1 - svgYCoord / 100

  return { x, y }
}

function onPointerDown(handle: 'p1' | 'p2', event: PointerEvent) {
  dragging.value = handle
  ;(event.target as Element).setPointerCapture?.(event.pointerId)
  event.preventDefault()
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  const position = pointerToCurve(event)
  if (!position) return
  setHandle(dragging.value, position.x, position.y)
}

function onPointerUp() {
  dragging.value = null
}

/* Keyboard is a first-class path, not a fallback: 0.01 per press, 0.1 with
   shift, which is the same granularity the drag gives on a 400px graph. */
function onHandleKeydown(handle: 'p1' | 'p2', event: KeyboardEvent) {
  const stepSize = event.shiftKey ? 0.1 : 0.01
  const current =
    handle === 'p1'
      ? { x: points.value.x1, y: points.value.y1 }
      : { x: points.value.x2, y: points.value.y2 }

  let { x, y } = current

  switch (event.key) {
    case 'ArrowLeft':
      x -= stepSize
      break
    case 'ArrowRight':
      x += stepSize
      break
    case 'ArrowUp':
      y += stepSize
      break
    case 'ArrowDown':
      y -= stepSize
      break
    case 'Home':
      x = 0
      break
    case 'End':
      x = 1
      break
    default:
      return
  }

  event.preventDefault()
  setHandle(handle, Number(x.toFixed(3)), Number(y.toFixed(3)))
}

function handleValueText(handle: 'p1' | 'p2') {
  const { x1, y1, x2, y2 } = points.value
  const x = handle === 'p1' ? x1 : x2
  const y = handle === 'p1' ? y1 : y2
  return `x ${x.toFixed(2)}, y ${y.toFixed(2)}`
}

/* Preview. `running` drives the transition; the nextTick round-trip is what
   makes the button repeatable rather than a one-shot. Auto-reset after the
   transition finishes so the user can replay without manually resetting. */
const running = ref(false)
const previewEl = ref<HTMLElement | null>(null)

async function play() {
  running.value = false
  await nextTick()
  running.value = true
}

function onPreviewTransitionEnd() {
  if (!running.value) return
  setTimeout(async () => {
    running.value = false
  }, 400)
}

const numericFields = computed(() => [
  { key: 'x1' as const, label: 'Control point 1 — x', min: 0, max: 1 },
  { key: 'y1' as const, label: 'Control point 1 — y', min: Y_MIN, max: Y_MAX },
  { key: 'x2' as const, label: 'Control point 2 — x', min: 0, max: 1 },
  { key: 'y2' as const, label: 'Control point 2 — y', min: Y_MIN, max: Y_MAX },
])

function setField(key: keyof BezierPoints, value: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return

  const isX = key === 'x1' || key === 'x2'
  points.value = {
    ...points.value,
    [key]: clamp(parsed, isX ? X_MIN : Y_MIN, isX ? X_MAX : Y_MAX),
  }
}

const css = computed(() =>
  [
    `transition-timing-function: ${timingFunction.value};`,
    `transition-duration: ${duration.value}ms;`,
  ].join('\n'),
)
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 07"
      cover-line="Motion is a sentence, and easing is its punctuation."
      lead="Linear movement reads as machinery. A curve tells the eye whether something arrived, was pushed, or simply appeared. Drag the two handles, or move them with the arrow keys, and watch the same duration change meaning."
    />

    <section aria-labelledby="curve-heading" class="gutter mt-20 md:mt-28">
      <h2 id="curve-heading" class="caption">The curve</h2>

      <div class="mt-14 lg:grid lg:grid-cols-12 lg:gap-x-8">
        <!-- Left column: presets -->
        <div class="lg:col-span-4">
          <EasingPresetPicker v-model="preset" />
        </div>

        <!-- Centre column: curve graph -->
        <div class="mt-12 lg:col-span-4 lg:mt-0">
          <div class="w-full">
            <svg
              ref="svg"
              viewBox="-4 -4 108 108"
              class="w-full touch-none select-none overflow-visible"
              role="group"
              aria-label="Cubic bezier curve editor"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointerleave="onPointerUp"
              @pointercancel="onPointerUp"
            >
              <rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--color-rule)" stroke-width="0.5" />
              <line x1="0" y1="100" x2="100" y2="100" stroke="var(--color-rule)" stroke-width="0.5" />

              <line
                x1="0"
                y1="100"
                :x2="toSvgX(points.x1)"
                :y2="toSvgY(points.y1)"
                stroke="var(--color-ink-faint)"
                stroke-width="0.5"
              />
              <line
                x1="100"
                y1="0"
                :x2="toSvgX(points.x2)"
                :y2="toSvgY(points.y2)"
                stroke="var(--color-ink-faint)"
                stroke-width="0.5"
              />

              <path :d="curvePath" fill="none" stroke="var(--color-ink)" stroke-width="1.25" />

              <!-- Each handle carries a transparent hit area (r=5, ~32px at 320px
                   graph width) so touch and coarse pointers get a target that meets
                   WCAG 2.5.5 without the visible dot being oversized. -->
              <g
                v-for="handle in (['p1', 'p2'] as const)"
                :key="handle"
                tabindex="0"
                role="slider"
                :aria-label="handle === 'p1' ? 'Control point 1' : 'Control point 2'"
                :aria-valuetext="handleValueText(handle)"
                class="cursor-grab focus-visible:outline-2 focus-visible:outline-blue"
                @pointerdown="onPointerDown(handle, $event)"
                @keydown="onHandleKeydown(handle, $event)"
              >
                <circle
                  :cx="handle === 'p1' ? toSvgX(points.x1) : toSvgX(points.x2)"
                  :cy="handle === 'p1' ? toSvgY(points.y1) : toSvgY(points.y2)"
                  r="5"
                  fill="transparent"
                />
                <circle
                  :cx="handle === 'p1' ? toSvgX(points.x1) : toSvgX(points.x2)"
                  :cy="handle === 'p1' ? toSvgY(points.y1) : toSvgY(points.y2)"
                  r="2"
                  fill="var(--color-paper)"
                  stroke="var(--color-blue)"
                  stroke-width="1"
                />
              </g>
            </svg>
          </div>

          <p class="caption mt-4 text-center normal-case tracking-normal text-ink-muted">
            Drag a handle, or focus it and use the arrow keys. Hold shift for larger steps.
          </p>
        </div>

        <!-- Right column: values + controls -->
        <div class="mt-12 lg:col-span-4 lg:mt-0">
          <p class="caption">Value</p>
          <output class="mt-3 block font-display text-title tabular-nums" aria-live="off">
            {{ timingFunction }}
          </output>

          <ToolStatus :text="statusText" />

          <div class="mt-10 space-y-6">
            <ToolField
              v-for="field in numericFields"
              :key="field.key"
              :label="field.label"
              :model-value="points[field.key]"
              type="number"
              inputmode="decimal"
              :min="field.min"
              :max="field.max"
              :step="0.01"
              @update:model-value="setField(field.key, $event)"
            />
          </div>

          <div class="mt-10">
            <CopyButton
              :value="timingFunction"
              label="Copy cubic-bezier"
              variant="solid"
              message="Timing function copied"
            />
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="preview-heading" class="gutter mt-section">
      <h2 id="preview-heading" class="caption">Preview</h2>

      <div class="mt-8 border-t border-ink pt-10">
        <div class="flex flex-wrap items-end justify-between gap-8">
          <button
            type="button"
            :disabled="running"
            class="caption inline-flex min-h-11 items-center gap-2 border px-5 normal-case tracking-normal transition-colors duration-200 ease-editorial disabled:cursor-not-allowed disabled:border-rule disabled:bg-rule disabled:text-ink-muted"
            :class="running ? '' : 'border-ink bg-ink text-paper hover:border-blue hover:bg-blue'"
            @click="play"
          >
            <span aria-hidden="true">{{ running ? '⏸' : '▶' }}</span>
            {{ running ? 'Playing…' : 'Play preview' }}
          </button>

          <div class="w-full max-w-xs">
            <ToolSlider v-model="duration" label="Duration" :min="200" :max="2000" :step="50" unit="ms" />
          </div>
        </div>

        <!-- The travelling square is positioned rather than transformed so the
             end point is `100% - width` without needing container queries. -->
        <div class="relative mt-12 h-[6.5rem] border-t border-rule pt-12" aria-hidden="true">
          <div
            ref="previewEl"
            class="absolute top-12 size-14 bg-blue"
            :style="{
              left: running ? 'calc(100% - 3.5rem)' : '0px',
              transitionProperty: 'left',
              transitionDuration: `${duration}ms`,
              transitionTimingFunction: timingFunction,
            }"
            @transitionend="onPreviewTransitionEnd"
          />
        </div>
      </div>
    </section>

    <section aria-labelledby="easing-output-heading" class="gutter mt-section">
      <h2 id="easing-output-heading" class="sr-only">Copy-ready output</h2>
      <CodeBlock :code="css" label="Copy-ready CSS" copy-label="Copy CSS" />
    </section>

    <ToolReference slug="easing-curves" />

    <ToolFooterNav slug="easing-curves" />
  </div>
</template>
