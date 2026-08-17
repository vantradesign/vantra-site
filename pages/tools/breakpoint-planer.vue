<!--
  PM FRAMING
  Problem: Breakpoint values are typically copied from a framework's defaults
  without visualising what each actually means for the layout. Naming conventions
  vary (sm/md/lg vs. phone/tablet/desktop) and documenting the intent is an
  afterthought.
  Audience: Design-systems leads and frontend engineers defining responsive tokens.
  Done: An editable breakpoint list with live device-width previews, saved into
  the shared token schema, exportable as CSS variables and Tailwind config.

  NOT "just another generator": breakpoints are saved as named tokens in the
  shared schema, alongside colour and z-index tokens. No other free tool ties
  breakpoints into a design-token file.
-->
<script setup lang="ts">
import type { BreakpointToken } from '~/utils/tools/token-schema'
import { breakpointsToCss, breakpointsToTailwind } from '~/utils/tools/export'

useToolPageSeo({
  slug: 'breakpoint-planer',
  title: 'Breakpoint Planer',
  description:
    'Visualise and generate responsive breakpoint tokens with a live device-frame preview. Export as CSS custom properties or Tailwind config.',
})

const { setBreakpointTokens } = useTokenSchema()
const { push } = useToast()

// ── Breakpoint model ───────────────────────────────────────────────────────

interface Breakpoint {
  id: string
  key: string
  value: number
  unit: 'px' | 'em' | 'rem'
}

const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { id: '1', key: 'sm', value: 640, unit: 'px' },
  { id: '2', key: 'md', value: 768, unit: 'px' },
  { id: '3', key: 'lg', value: 1024, unit: 'px' },
  { id: '4', key: 'xl', value: 1280, unit: 'px' },
  { id: '5', key: '2xl', value: 1536, unit: 'px' },
]

const breakpoints = ref<Breakpoint[]>(structuredClone(DEFAULT_BREAKPOINTS))
let nextId = 6

const sorted = computed(() =>
  [...breakpoints.value].sort((a, b) => a.value - b.value),
)

// ── Preview viewport ───────────────────────────────────────────────────────

const previewWidth = ref(1024)

const activeBreakpoint = computed(() => {
  const s = sorted.value
  for (let i = s.length - 1; i >= 0; i--) {
    if (previewWidth.value >= s[i]!.value) return s[i]!.key
  }
  return 'below ' + (s[0]?.key ?? 'sm')
})

// ── Actions ────────────────────────────────────────────────────────────────

function addBreakpoint() {
  const highest = Math.max(0, ...breakpoints.value.map((b) => b.value))
  breakpoints.value.push({
    id: String(nextId++),
    key: `bp-${breakpoints.value.length + 1}`,
    value: highest + 256,
    unit: 'px',
  })
}

function removeBreakpoint(id: string) {
  if (breakpoints.value.length <= 1) return
  breakpoints.value = breakpoints.value.filter((b) => b.id !== id)
}

// ── Export ──────────────────────────────────────────────────────────────────

const tokens = computed<Record<string, BreakpointToken>>(() => {
  const result: Record<string, BreakpointToken> = {}
  for (const bp of breakpoints.value) {
    result[bp.key] = { $type: 'breakpoint', $value: bp.value, unit: bp.unit }
  }
  return result
})

const cssOutput = computed(() => breakpointsToCss(tokens.value))
const tailwindOutput = computed(() => breakpointsToTailwind(tokens.value))

const exportMode = ref<'css' | 'tailwind'>('css')
const currentExport = computed(() =>
  exportMode.value === 'tailwind' ? tailwindOutput.value : cssOutput.value,
)

// ── Save to schema ─────────────────────────────────────────────────────────

const saved = ref(false)

function saveToSchema() {
  setBreakpointTokens(tokens.value)
  saved.value = true
  push('Breakpoint tokens saved to schema')
  setTimeout(() => { saved.value = false }, 2000)
}

// ── Status text ────────────────────────────────────────────────────────────

const statusText = computed(() =>
  `${breakpoints.value.length} breakpoints. Preview at ${previewWidth.value}px matches "${activeBreakpoint.value}".`,
)
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 14"
      cover-line="A breakpoint without a reason is a breakpoint without a future."
      lead="Copying 640/768/1024/1280 from a framework default is not deciding — it is deferring. This tool lets you define each breakpoint, name it, and see what it actually does to a sample layout before it becomes a token. The result saves into the shared schema and exports as CSS or Tailwind config."
    />

    <section aria-labelledby="breakpoints-heading" class="gutter mt-20 md:mt-28">
      <h2 id="breakpoints-heading" class="caption">Breakpoints</h2>

      <div class="mt-8 md:grid md:grid-cols-12 md:gap-x-8">
        <!-- Breakpoint list -->
        <div class="md:col-span-5">
          <div v-if="breakpoints.length === 0" class="border border-rule p-8 text-center">
            <p class="font-display text-title text-ink-muted">No breakpoints defined.</p>
            <p class="mt-2 text-ink-faint">Add your first breakpoint below.</p>
          </div>

          <ul class="space-y-4">
            <li
              v-for="bp in sorted"
              :key="bp.id"
              class="flex items-end gap-4 border-b border-rule pb-4"
            >
              <input
                v-model="bp.key"
                type="text"
                class="w-24 shrink-0 appearance-none border-b border-rule bg-transparent py-2 font-mono text-body text-ink outline-none transition-colors duration-200 ease-editorial focus:border-ink"
                aria-label="Breakpoint name"
              />
              <input
                v-model.lazy.number="bp.value"
                type="number"
                :min="0"
                :max="9999"
                class="min-w-0 flex-1 appearance-none border-b border-rule bg-transparent py-2 font-display text-title tabular-nums text-ink outline-none transition-colors duration-200 ease-editorial focus:border-ink"
                aria-label="Breakpoint value"
              />
              <span class="caption shrink-0 self-center text-ink-faint">{{ bp.unit }}</span>
              <button
                type="button"
                class="caption ml-auto shrink-0 text-ink-faint transition-colors hover:text-fail"
                :aria-label="`Remove ${bp.key}`"
                :disabled="breakpoints.length <= 1"
                @click="removeBreakpoint(bp.id)"
              >
                ✕
              </button>
            </li>
          </ul>

          <div class="mt-6">
            <button
              type="button"
              class="caption inline-flex min-h-11 items-center gap-2 border border-rule px-4 normal-case tracking-normal transition-colors duration-200 ease-editorial hover:border-ink"
              @click="addBreakpoint"
            >
              + Add breakpoint
            </button>
          </div>
        </div>

        <!-- Live device-frame preview -->
        <div class="mt-12 md:col-span-6 md:col-start-7 md:mt-0">
          <p class="caption mb-4">Preview viewport</p>

          <ToolSlider
            v-model="previewWidth"
            label="Viewport width"
            :min="320"
            :max="1920"
            :step="1"
            unit="px"
          />

          <p class="caption mt-4 normal-case tracking-normal">
            Active breakpoint:
            <span class="text-ink font-bold">{{ activeBreakpoint }}</span>
          </p>

          <div class="mt-6 border border-rule">
            <!-- Scaled preview frame -->
            <div class="overflow-hidden">
              <div
                class="border-x border-blue/20 bg-paper transition-all duration-300 ease-editorial"
                :style="{ width: `${Math.min(100, (previewWidth / 1920) * 100)}%`, minHeight: '10rem' }"
              >
                <!-- Sample layout that reflows -->
                <div class="p-4">
                  <div
                    class="h-4 rounded bg-ink/15 transition-all duration-300"
                    :style="{ width: '100%' }"
                  />
                  <div class="mt-3 flex gap-3 transition-all duration-300" :class="previewWidth < (sorted[1]?.value ?? 768) ? 'flex-col' : 'flex-row'">
                    <div class="h-16 flex-1 rounded bg-ink/10" />
                    <div class="h-16 flex-1 rounded bg-ink/10" />
                    <div v-if="previewWidth >= (sorted[2]?.value ?? 1024)" class="h-16 flex-1 rounded bg-blue/15" />
                  </div>
                  <div class="mt-3 h-3 w-3/4 rounded bg-ink/8" />
                </div>
              </div>
            </div>

            <!-- Breakpoint rulers — inside border container for alignment -->
            <div class="relative mt-4 h-8">
              <div
                v-for="bp in sorted"
                :key="`ruler-${bp.id}`"
                class="absolute bottom-0 border-l transition-all duration-300 ease-editorial"
                :class="previewWidth >= bp.value ? 'border-blue' : 'border-rule'"
                :style="{ left: `${Math.min((bp.value / 1920) * 100, 100)}%`, height: '100%' }"
              >
                <span
                  class="caption absolute -top-5 left-0 -translate-x-1/2 whitespace-nowrap tabular-nums uppercase"
                  :class="previewWidth >= bp.value ? 'text-blue' : 'text-ink-faint'"
                >
                  {{ bp.key }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="bp-export-heading" class="gutter mt-section">
      <h2 id="bp-export-heading" class="caption">Export</h2>

      <div class="mt-6 flex flex-wrap items-start gap-6">
        <ToolToggle
          v-model="exportMode"
          label="Export format"
          :options="[
            { value: 'css', label: 'CSS' },
            { value: 'tailwind', label: 'Tailwind v3' },
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
          :label="exportMode === 'tailwind' ? 'Tailwind v3 config' : 'CSS custom properties'"
          :copy-label="`Copy ${exportMode === 'tailwind' ? 'config' : 'CSS'}`"
        />

        <p v-if="exportMode === 'tailwind'" class="caption mt-4 normal-case tracking-normal text-ink-faint">
          This format is for Tailwind v3 and its <code class="font-mono">tailwind.config</code> file. Tailwind v4 uses CSS-native configuration — use the CSS export instead.
        </p>
      </div>
    </section>

    <ToolStatus :text="statusText" />

    <ToolReference slug="breakpoint-planer" />

    <ToolFooterNav slug="breakpoint-planer" />
  </div>
</template>
