<!--
  PM FRAMING
  Problem: z-index in production is a graveyard of magic numbers — z-index: 9999
  next to z-index: 10000 because someone needed "one more." Named, spaced tokens
  eliminate the guessing and make the stacking order reviewable.
  Audience: Frontend engineers and design-systems leads maintaining a token file.
  Done: A visual stacked-layer planer that emits named z-index tokens saved into
  the shared schema, exportable as CSS variables and Tailwind config.

  NOT "just another generator": z-index tokens are saved into the shared schema
  and interact with the layout/breakpoint tokens. No competing tool ties z-index
  into a broader token system.
-->
<script setup lang="ts">
import type { ZIndexToken } from '~/utils/tools/token-schema'
import { zIndexTokensToCss, zIndexToTailwind } from '~/utils/tools/export'

useToolPageSeo({
  slug: 'z-index-planer',
  title: 'Z-Index Planer',
  description:
    'Define a documented, conflict-free z-index scale as named tokens. Visual stacked-layer preview, auto-spaced values, export as CSS or Tailwind config.',
})

const { setZIndexTokens } = useTokenSchema()
const { push } = useToast()

// ── Default layers ─────────────────────────────────────────────────────────

interface Layer {
  id: string
  key: string
  label: string
  value: number
}

const DEFAULT_LAYERS: Layer[] = [
  { id: '1', key: 'base', label: 'Base content', value: 0 },
  { id: '2', key: 'dropdown', label: 'Dropdown', value: 100 },
  { id: '3', key: 'sticky', label: 'Sticky header', value: 200 },
  { id: '4', key: 'overlay', label: 'Overlay', value: 300 },
  { id: '5', key: 'modal', label: 'Modal', value: 400 },
  { id: '6', key: 'toast', label: 'Toast', value: 500 },
  { id: '7', key: 'tooltip', label: 'Tooltip', value: 600 },
]

const layers = ref<Layer[]>(structuredClone(DEFAULT_LAYERS))
const spacing = ref(100)

let nextId = 8

// ── Derived ────────────────────────────────────────────────────────────────

const sortedLayers = computed(() =>
  [...layers.value].sort((a, b) => a.value - b.value),
)

const maxValue = computed(() =>
  Math.max(1, ...layers.value.map((l) => l.value)),
)

// ── Actions ────────────────────────────────────────────────────────────────

function addLayer() {
  const highest = Math.max(0, ...layers.value.map((l) => l.value))
  layers.value.push({
    id: String(nextId++),
    key: `layer-${layers.value.length + 1}`,
    label: 'New layer',
    value: highest + spacing.value,
  })
}

function removeLayer(id: string) {
  if (layers.value.length <= 1) return
  layers.value = layers.value.filter((l) => l.id !== id)
}

function reSpace() {
  const sorted = [...layers.value].sort((a, b) => a.value - b.value)
  sorted.forEach((layer, i) => {
    layer.value = i * spacing.value
  })
  layers.value = [...sorted]
}

// ── Export ──────────────────────────────────────────────────────────────────

const tokens = computed<Record<string, ZIndexToken>>(() => {
  const result: Record<string, ZIndexToken> = {}
  for (const layer of layers.value) {
    result[layer.key] = {
      $type: 'zIndex',
      $value: layer.value,
      label: layer.label,
    }
  }
  return result
})

const cssOutput = computed(() => zIndexTokensToCss(tokens.value))
const tailwindOutput = computed(() => zIndexToTailwind(tokens.value))

const exportMode = ref<'css' | 'tailwind'>('css')
const currentExport = computed(() =>
  exportMode.value === 'tailwind' ? tailwindOutput.value : cssOutput.value,
)

// ── Save to schema ─────────────────────────────────────────────────────────

const saved = ref(false)

function saveToSchema() {
  setZIndexTokens(tokens.value)
  saved.value = true
  push('Z-index tokens saved to schema')
  setTimeout(() => { saved.value = false }, 2000)
}

// ── Status text ────────────────────────────────────────────────────────────

const statusText = computed(() =>
  `${layers.value.length} layers, spaced at ${spacing.value}. Range ${Math.min(...layers.value.map((l) => l.value))} to ${Math.max(...layers.value.map((l) => l.value))}.`,
)
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 13"
      cover-line="Naming a layer is harder than numbering it. That is the point."
      lead="z-index: 9999 is not a decision, it is a surrender. A named, spaced scale makes the stacking order readable in a token file and reviewable in a diff. This tool lets you define the layers, spaces them automatically, and writes the result into the shared token schema."
    />

    <section aria-labelledby="layers-heading" class="gutter mt-20 md:mt-28">
      <h2 id="layers-heading" class="caption">Layers</h2>

      <div class="mt-8 md:grid md:grid-cols-12 md:gap-x-8">
        <!-- Layer list (left) -->
        <div class="md:col-span-6">
          <div class="mb-6">
            <ToolSlider
              v-model="spacing"
              label="Step spacing"
              :min="10"
              :max="500"
              :step="10"
            />
          </div>

          <div v-if="layers.length === 0" class="border border-rule p-8 text-center">
            <p class="font-display text-title text-ink-muted">No layers defined.</p>
            <p class="mt-2 text-ink-faint">Add your first layer below.</p>
          </div>

          <ul class="space-y-4">
            <li
              v-for="layer in sortedLayers"
              :key="layer.id"
              class="flex items-center gap-4 border-b border-rule pb-4"
            >
              <span
                class="caption tabular-nums text-ink-faint"
                style="min-width: 3.5rem"
              >
                {{ layer.value }}
              </span>
              <input
                v-model="layer.key"
                type="text"
                class="w-28 shrink-0 appearance-none border-b border-rule bg-transparent py-1 font-mono text-[0.875rem] text-ink outline-none transition-colors duration-200 ease-editorial focus:border-ink"
                aria-label="Token key"
              />
              <input
                v-model="layer.label"
                type="text"
                class="min-w-0 flex-1 appearance-none border-b border-rule bg-transparent py-1 text-body text-ink outline-none transition-colors duration-200 ease-editorial focus:border-ink"
                aria-label="Layer label"
              />
              <button
                type="button"
                class="caption shrink-0 text-ink-faint transition-colors hover:text-fail"
                :aria-label="`Remove ${layer.label}`"
                :disabled="layers.length <= 1"
                @click="removeLayer(layer.id)"
              >
                ✕
              </button>
            </li>
          </ul>

          <div class="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              class="caption inline-flex min-h-11 items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink"
              @click="addLayer"
            >
              + Add layer
            </button>
            <button
              type="button"
              class="caption inline-flex min-h-11 items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink"
              @click="reSpace"
            >
              Re-space evenly
            </button>
          </div>
        </div>

        <!-- Visual stacking preview (right) -->
        <div class="mt-12 md:col-span-5 md:col-start-8 md:mt-0">
          <p class="caption mb-4">Stacking preview</p>

          <div class="relative" style="min-height: 20rem">
            <div
              v-for="(layer, i) in sortedLayers"
              :key="layer.id"
              class="absolute left-0 border transition-all duration-300 ease-editorial"
              :class="i === sortedLayers.length - 1
                ? 'border-blue bg-blue/8'
                : 'border-rule bg-paper'"
              :style="{
                bottom: `${(layer.value / maxValue) * 60}%`,
                left: `${i * 12}px`,
                right: `${(sortedLayers.length - 1 - i) * 12}px`,
                height: '3.5rem',
                zIndex: layer.value,
              }"
            >
              <span class="caption absolute left-3 top-2 normal-case tracking-normal text-ink">
                {{ layer.label }}
              </span>
              <span class="caption absolute right-3 bottom-2 tabular-nums text-ink-faint">
                {{ layer.value }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="zindex-export-heading" class="gutter mt-section">
      <h2 id="zindex-export-heading" class="caption">Export</h2>

      <div class="mt-6 flex flex-wrap items-start gap-6">
        <ToolToggle
          v-model="exportMode"
          label="Export format"
          :options="[
            { value: 'css', label: 'CSS' },
            { value: 'tailwind', label: 'Tailwind' },
          ]"
        />

        <button
          type="button"
          class="caption inline-flex min-h-11 items-center gap-2 border px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial"
          :class="saved
            ? 'border-pass bg-pass text-paper'
            : 'border-ink bg-ink text-paper hover:bg-blue hover:border-blue'"
          @click="saveToSchema"
        >
          <span aria-hidden="true">{{ saved ? '✓' : '↓' }}</span>
          {{ saved ? 'Saved' : 'Save to token schema' }}
        </button>
      </div>

      <div class="mt-6">
        <CodeBlock
          :code="currentExport"
          :label="exportMode === 'tailwind' ? 'Tailwind config' : 'CSS custom properties'"
          :copy-label="`Copy ${exportMode === 'tailwind' ? 'config' : 'CSS'}`"
        />
      </div>
    </section>

    <ToolStatus :text="statusText" />

    <ToolReference slug="z-index-planer" />

    <ToolFooterNav slug="z-index-planer" />
  </div>
</template>
