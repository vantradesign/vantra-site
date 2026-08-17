<!--
  PM FRAMING
  Problem: Icon consistency (viewBox, stroke width, optical alignment to a
  keyline grid) is usually verified by eye or by a CLI linter that outputs a
  text report. No drag-and-drop web tool exists for this.
  Audience: Icon designers and design-systems leads maintaining an icon library.
  Done: A visual grid overlay per icon, automated flags for deviations, and a
  pass/fail summary table — the first web-based icon-grid checker.

  NOT "just another generator": this is a genuine gap — existing tools are
  CLI-only (svgo, svglint). A clean drag-and-drop web UX with a visual keyline
  overlay does not exist in the market.
-->
<script setup lang="ts">
import { contrastRatio } from '~/utils/tools/color'

useToolPageSeo({
  slug: 'icon-grid-checker',
  title: 'Icon Grid Checker',
  description:
    'Drag and drop SVG icons to check them against a keyline grid for viewBox, stroke-width and optical consistency. Visual overlay and pass/fail summary.',
})

const { push } = useToast()

// ── Grid settings ──────────────────────────────────────────────────────────

const gridSize = ref(24)
const expectedStroke = ref(2)
const padding = ref(2)

// ── Icon state ─────────────────────────────────────────────────────────────

interface IconCheck {
  id: string
  filename: string
  svgContent: string
  viewBox: string | null
  width: number | null
  height: number | null
  strokeWidths: number[]
  boundingFits: boolean
  issues: string[]
  passes: boolean
}

const icons = ref<IconCheck[]>([])
const isDragOver = ref(false)

// ── SVG parsing ────────────────────────────────────────────────────────────

function parseSvg(filename: string, content: string): IconCheck {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'image/svg+xml')
  const svg = doc.querySelector('svg')
  const issues: string[] = []

  const viewBox = svg?.getAttribute('viewBox') ?? null
  const width = svg ? parseFloat(svg.getAttribute('width') ?? '0') || null : null
  const height = svg ? parseFloat(svg.getAttribute('height') ?? '0') || null : null

  // Check viewBox
  let viewBoxParts: number[] = []
  if (!viewBox) {
    issues.push('Missing viewBox attribute')
  } else {
    viewBoxParts = viewBox.split(/[\s,]+/).map(Number)
    if (viewBoxParts.length !== 4 || viewBoxParts.some(isNaN)) {
      issues.push(`Invalid viewBox: "${viewBox}"`)
    } else {
      const [, , vw, vh] = viewBoxParts
      if (vw !== gridSize.value || vh !== gridSize.value) {
        issues.push(`viewBox is ${vw}×${vh}, expected ${gridSize.value}×${gridSize.value}`)
      }
    }
  }

  // Check stroke-width
  const strokeWidths: number[] = []
  const allElements = doc.querySelectorAll('*')
  allElements.forEach((el) => {
    const sw = el.getAttribute('stroke-width')
    if (sw) {
      const val = parseFloat(sw)
      if (!isNaN(val) && !strokeWidths.includes(val)) {
        strokeWidths.push(val)
      }
    }
    // Also check inline style
    const style = el.getAttribute('style')
    if (style) {
      const match = style.match(/stroke-width:\s*([\d.]+)/)
      if (match) {
        const val = parseFloat(match[1]!)
        if (!isNaN(val) && !strokeWidths.includes(val)) {
          strokeWidths.push(val)
        }
      }
    }
  })

  if (strokeWidths.length === 0) {
    // No explicit stroke-width found — might be fill-only icon, which is fine
  } else {
    const nonMatching = strokeWidths.filter((sw) => sw !== expectedStroke.value)
    if (nonMatching.length > 0) {
      issues.push(
        `Stroke width: ${nonMatching.join(', ')} (expected ${expectedStroke.value})`,
      )
    }
  }

  // Check bounding within padding
  let boundingFits = true
  if (viewBoxParts.length === 4) {
    const [vx, vy, vw, vh] = viewBoxParts as [number, number, number, number]
    // Check if the SVG content uses the full viewBox minus padding
    // This is a heuristic — we check if explicit x/y/cx/cy attributes sit inside the padded area
    const shapes = doc.querySelectorAll('rect, circle, ellipse, line, polyline, polygon, path')
    shapes.forEach((shape) => {
      const x = parseFloat(shape.getAttribute('x') ?? shape.getAttribute('cx') ?? '0')
      const y = parseFloat(shape.getAttribute('y') ?? shape.getAttribute('cy') ?? '0')
      if (x < vx + padding.value * 0.5 || y < vy + padding.value * 0.5) {
        boundingFits = false
      }
    })
  }

  if (!boundingFits) {
    issues.push(`Content may exceed ${padding.value}px padding zone`)
  }

  return {
    id: `${filename}-${Date.now()}`,
    filename,
    svgContent: content,
    viewBox,
    width,
    height,
    strokeWidths,
    boundingFits,
    issues,
    passes: issues.length === 0,
  }
}

// ── File handling ──────────────────────────────────────────────────────────

async function handleFiles(files: FileList | File[]) {
  const svgFiles = Array.from(files).filter(
    (f) => f.type === 'image/svg+xml' || f.name.endsWith('.svg'),
  )

  if (svgFiles.length === 0) {
    push('No SVG files found. Drop .svg files to check them.', 'error')
    return
  }

  for (const file of svgFiles) {
    const content = await file.text()
    icons.value.push(parseSvg(file.name, content))
  }

  push(`${svgFiles.length} icon${svgFiles.length > 1 ? 's' : ''} loaded`)
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) handleFiles(input.files)
}

function removeIcon(id: string) {
  icons.value = icons.value.filter((icon) => icon.id !== id)
}

function clearAll() {
  icons.value = []
}

// ── Summary ────────────────────────────────────────────────────────────────

const passCount = computed(() => icons.value.filter((i) => i.passes).length)
const failCount = computed(() => icons.value.filter((i) => !i.passes).length)

const statusText = computed(() => {
  if (icons.value.length === 0) return 'Drop SVG icons to begin checking.'
  return `${icons.value.length} icons checked. ${passCount.value} pass, ${failCount.value} fail.`
})
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 15"
      cover-line="An icon set without a grid is a set without a system."
      lead="Stroke width, viewBox, optical padding — the things that make twenty icons read as one family are exactly the things nobody checks until the set ships inconsistent. Drop your SVGs here and see which ones break the grid. Every check runs in the browser."
    />

    <section aria-labelledby="grid-settings-heading" class="gutter mt-20 md:mt-28">
      <h2 id="grid-settings-heading" class="caption">Grid settings</h2>

      <div class="mt-8 grid gap-8 sm:grid-cols-3">
        <ToolSlider
          v-model="gridSize"
          label="Grid size"
          :min="16"
          :max="48"
          :step="1"
          unit="px"
        />
        <ToolSlider
          v-model="expectedStroke"
          label="Expected stroke width"
          :min="0.5"
          :max="4"
          :step="0.25"
          unit="px"
        />
        <ToolSlider
          v-model="padding"
          label="Keyline padding"
          :min="0"
          :max="6"
          :step="0.5"
          unit="px"
        />
      </div>
    </section>

    <section aria-labelledby="drop-heading" class="gutter mt-section">
      <h2 id="drop-heading" class="caption">Icons</h2>

      <!-- Drop zone / empty state -->
      <div
        v-if="icons.length === 0"
        class="mt-8 flex min-h-64 flex-col items-center justify-center border-2 border-dashed transition-colors duration-200"
        :class="isDragOver ? 'border-blue bg-blue/4' : 'border-rule'"
        @drop.prevent="onDrop"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
      >
        <p class="font-display text-title text-ink-muted">Drop SVG files here</p>
        <p class="mt-3 text-ink-faint">or select files from your machine</p>
        <label class="caption mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink">
          Choose files
          <input
            type="file"
            accept=".svg,image/svg+xml"
            multiple
            class="sr-only"
            @change="onFileInput"
          />
        </label>
      </div>

      <!-- Icon grid with overlays -->
      <template v-else>
        <div class="mt-6 flex flex-wrap items-center gap-4">
          <label class="caption inline-flex min-h-11 cursor-pointer items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink">
            + Add more
            <input
              type="file"
              accept=".svg,image/svg+xml"
              multiple
              class="sr-only"
              @change="onFileInput"
            />
          </label>
          <button
            type="button"
            class="caption inline-flex min-h-11 items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink"
            @click="clearAll"
          >
            Clear all
          </button>
          <p class="caption tabular-nums text-ink-muted">
            <span class="text-pass">{{ passCount }} pass</span>
            <span v-if="failCount > 0" class="ml-3 text-fail">{{ failCount }} fail</span>
          </p>
        </div>

        <ul class="mt-8 grid gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <li v-for="icon in icons" :key="icon.id" class="group relative">
            <div
              class="relative flex aspect-square items-center justify-center border p-4"
              :class="icon.passes ? 'border-rule' : 'border-fail'"
            >
              <!-- Keyline grid overlay -->
              <svg
                class="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <!-- Center cross -->
                <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" stroke-width="0.5" class="text-ink/8" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" stroke-width="0.5" class="text-ink/8" />
                <!-- Padding zone -->
                <rect
                  :x="(padding / gridSize) * 100"
                  :y="(padding / gridSize) * 100"
                  :width="100 - (padding / gridSize) * 200"
                  :height="100 - (padding / gridSize) * 200"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="0.5"
                  stroke-dasharray="2 2"
                  class="text-blue/25"
                />
                <!-- Circle keyline -->
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="0.5" class="text-ink/6" />
              </svg>

              <!-- The icon itself -->
              <div
                class="relative h-full w-full"
                v-html="icon.svgContent"
              />

              <!-- Remove button -->
              <button
                type="button"
                class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-paper text-ink-faint opacity-0 shadow transition-opacity group-hover:opacity-100 hover:text-fail"
                :aria-label="`Remove ${icon.filename}`"
                @click="removeIcon(icon.id)"
              >
                ✕
              </button>
            </div>

            <p class="caption mt-2 truncate normal-case tracking-normal text-ink">
              {{ icon.filename }}
            </p>
            <p v-if="icon.passes" class="caption normal-case tracking-normal text-pass">
              Pass
            </p>
            <ul v-else class="mt-1 space-y-0.5">
              <li
                v-for="(issue, idx) in icon.issues"
                :key="idx"
                class="text-[0.75rem] leading-snug text-fail"
              >
                {{ issue }}
              </li>
            </ul>
          </li>
        </ul>
      </template>
    </section>

    <!-- Summary table -->
    <section v-if="icons.length > 0" aria-labelledby="summary-heading" class="gutter mt-section">
      <h2 id="summary-heading" class="caption">Summary</h2>

      <div class="mt-6 overflow-x-auto">
        <table class="w-full text-left text-body">
          <thead>
            <tr class="border-b border-ink">
              <th class="caption py-3 pr-6 font-normal">File</th>
              <th class="caption py-3 pr-6 font-normal">viewBox</th>
              <th class="caption py-3 pr-6 font-normal">Stroke</th>
              <th class="caption py-3 pr-6 font-normal">Issues</th>
              <th class="caption py-3 font-normal">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="icon in icons" :key="`row-${icon.id}`" class="border-b border-rule">
              <td class="py-3 pr-6 font-mono text-[0.875rem]">{{ icon.filename }}</td>
              <td class="py-3 pr-6 tabular-nums">{{ icon.viewBox ?? '—' }}</td>
              <td class="py-3 pr-6 tabular-nums">
                {{ icon.strokeWidths.length > 0 ? icon.strokeWidths.join(', ') : '—' }}
              </td>
              <td class="py-3 pr-6">
                <span v-if="icon.issues.length === 0" class="text-ink-faint">None</span>
                <span v-else class="text-fail">{{ icon.issues.length }}</span>
              </td>
              <td class="py-3">
                <span :class="icon.passes ? 'text-pass' : 'text-fail'">
                  {{ icon.passes ? 'Pass' : 'Fail' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <ToolStatus :text="statusText" />

    <ToolReference slug="icon-grid-checker" />

    <ToolFooterNav slug="icon-grid-checker" />
  </div>
</template>
