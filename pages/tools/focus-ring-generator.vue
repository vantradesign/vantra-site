<!--
  PM FRAMING
  Problem: Focus rings need to contrast against the background at 3:1 (WCAG 2.2
  SC 1.4.11), but designers often pick a ring colour without checking it against
  every surface. The ring must also not collide with the element's own border.
  Audience: Design-systems leads and accessibility engineers.
  Done: Focus-ring styles generated from the shared token schema colours, with
  contrast checked live and exported as CSS :focus-visible rules.

  NOT "just another generator": the ring colour and background are read from the
  shared token schema — not manual hex input. This ties the focus ring to the
  system's actual palette, which standalone generators cannot do.
-->
<script setup lang="ts">
import { contrastRatio, formatRatio } from '~/utils/tools/color'
import { focusRingToCss } from '~/utils/tools/export'
import type { FocusRingConfig } from '~/utils/tools/token-schema'

useToolPageSeo({
  slug: 'focus-ring-generator',
  title: 'Focus Ring Generator',
  description:
    'Generate accessible :focus-visible styles with correct offset and WCAG-compliant contrast against your token schema backgrounds. Export as CSS.',
})

const { schema, setFocusRing, getColorPrimitives } = useTokenSchema()
const { push } = useToast()

// ── Read colours from token schema ─────────────────────────────────────────

const schemaPrimitives = computed(() => {
  const prims = getColorPrimitives()
  return Object.entries(prims).map(([key, token]) => ({
    key,
    hex: token.$value,
  }))
})

const schemaColorOptions = computed(() =>
  schemaPrimitives.value.map((p) => ({
    value: p.hex,
    label: p.key,
    swatch: p.hex,
    description: p.hex,
  })),
)

// ── Focus ring state ───────────────────────────────────────────────────────

const ringColor = ref('#021f94')
const ringWidth = ref(2)
const ringOffset = ref(3)
const ringStyle = ref<'solid' | 'double'>('double')
const backgroundColor = ref('#f5f2f3')
const haloColor = ref('#f5f2f3')

// ── Contrast checks ───────────────────────────────────────────────────────

const ringContrast = computed(() =>
  contrastRatio(ringColor.value, backgroundColor.value),
)

const ringPassesUiContrast = computed(() => ringContrast.value >= 3)

const haloContrast = computed(() =>
  ringStyle.value === 'double'
    ? contrastRatio(haloColor.value, ringColor.value)
    : null,
)

// ── Preview elements ───────────────────────────────────────────────────────

const previewElements = [
  { tag: 'button', label: 'Button', content: 'Save changes' },
  { tag: 'input', label: 'Input', content: '' },
  { tag: 'link', label: 'Link', content: 'Read more about this' },
]

const focusedPreview = ref<string | null>(null)

// ── CSS output ─────────────────────────────────────────────────────────────

const focusRingConfig = computed<FocusRingConfig>(() => ({
  $type: 'focusRing',
  color: ringColor.value,
  offset: ringOffset.value,
  width: ringWidth.value,
  style: ringStyle.value,
  background: backgroundColor.value,
  haloColor: ringStyle.value === 'double' ? haloColor.value : undefined,
}))

const cssOutput = computed(() => focusRingToCss(focusRingConfig.value))

// ── Save to schema ─────────────────────────────────────────────────────────

const saved = ref(false)

function saveToSchema() {
  setFocusRing(focusRingConfig.value)
  saved.value = true
  push('Focus ring saved to token schema')
  setTimeout(() => { saved.value = false }, 2000)
}

// ── Status text ────────────────────────────────────────────────────────────

const statusText = computed(() => {
  const verdict = ringPassesUiContrast.value ? 'passes' : 'fails'
  return `${ringWidth.value}px ${ringStyle.value} ring, ${ringOffset.value}px offset. Contrast ${formatRatio(ringContrast.value)} — ${verdict} 3:1 (SC 1.4.11).`
})
</script>

<template>
  <div>
    <ToolIntro
      kicker="Tools — 16"
      cover-line="The focus ring is the last thing anyone designs and the first thing a keyboard user sees."
      lead="WCAG 2.2 SC 1.4.11 requires 3:1 contrast between the focus indicator and the surface behind it. A blue ring on a dark sidebar that nobody checked is the single most common accessibility failure in production design systems. This tool reads your background colours from the token schema and tells you before you ship."
    />

    <section aria-labelledby="ring-settings-heading" class="gutter mt-20 md:mt-28">
      <h2 id="ring-settings-heading" class="caption">Ring settings</h2>

      <div class="mt-8 md:grid md:grid-cols-12 md:gap-x-8">
        <div class="md:col-span-5">
          <p class="caption mb-4 normal-case tracking-normal text-ink-muted">
            Colours from token schema
          </p>

          <div v-if="schemaColorOptions.length > 0" class="mb-6">
            <ToolChipRail
              v-model="ringColor"
              label="Ring colour"
              :chips="schemaColorOptions"
            />
          </div>

          <ColorPickerField
            v-model="ringColor"
            label="Ring colour"
            hint="The primary outline colour for :focus-visible."
          />

          <div class="mt-8">
            <ColorPickerField
              v-model="backgroundColor"
              label="Background"
              hint="The surface the ring sits on — used for contrast checking."
            />
          </div>

          <div v-if="ringStyle === 'double'" class="mt-8">
            <ColorPickerField
              v-model="haloColor"
              label="Halo colour"
              hint="The outer box-shadow ring for the double style."
            />
          </div>

          <div class="mt-8 grid grid-cols-2 gap-8">
            <ToolSlider
              v-model="ringWidth"
              label="Width"
              :min="1"
              :max="6"
              :step="1"
              unit="px"
            />
            <ToolSlider
              v-model="ringOffset"
              label="Offset"
              :min="0"
              :max="8"
              :step="1"
              unit="px"
            />
          </div>

          <div class="mt-8">
            <ToolToggle
              v-model="ringStyle"
              label="Ring style"
              :options="[
                { value: 'solid', label: 'Solid' },
                { value: 'double', label: 'Double (halo)' },
              ]"
            />
          </div>
        </div>

        <!-- Live preview -->
        <div class="mt-12 md:col-span-6 md:col-start-7 md:mt-0">
          <p class="caption mb-4">Preview</p>

          <div
            class="min-h-64 p-10 transition-colors duration-200 ease-editorial"
            :style="{ backgroundColor: backgroundColor }"
          >
            <!-- Button preview -->
            <button
              type="button"
              class="mb-6 inline-flex min-h-11 items-center border border-current px-6 py-2 font-sans text-body transition-colors"
              :style="{
                color: ringColor,
                outline: focusedPreview === 'button' ? `${ringWidth}px solid ${ringColor}` : 'none',
                outlineOffset: focusedPreview === 'button' ? `${ringOffset}px` : '0',
                boxShadow: focusedPreview === 'button' && ringStyle === 'double' && haloColor
                  ? `0 0 0 ${ringOffset + ringWidth + 2}px ${haloColor}`
                  : 'none',
              }"
              @focus="focusedPreview = 'button'"
              @blur="focusedPreview = null"
            >
              Save changes
            </button>

            <br />

            <!-- Input preview -->
            <input
              type="text"
              placeholder="Type something…"
              class="mb-6 w-full max-w-xs appearance-none border-b bg-transparent py-3 text-body outline-none"
              :style="{
                borderColor: focusedPreview === 'input' ? ringColor : 'currentColor',
                color: ringColor,
                outline: focusedPreview === 'input' ? `${ringWidth}px solid ${ringColor}` : 'none',
                outlineOffset: focusedPreview === 'input' ? `${ringOffset}px` : '0',
                boxShadow: focusedPreview === 'input' && ringStyle === 'double' && haloColor
                  ? `0 0 0 ${ringOffset + ringWidth + 2}px ${haloColor}`
                  : 'none',
              }"
              @focus="focusedPreview = 'input'"
              @blur="focusedPreview = null"
            />

            <br />

            <!-- Link preview -->
            <a
              href="#"
              class="text-body underline underline-offset-4"
              :style="{
                color: ringColor,
                outline: focusedPreview === 'link' ? `${ringWidth}px solid ${ringColor}` : 'none',
                outlineOffset: focusedPreview === 'link' ? `${ringOffset}px` : '0',
                boxShadow: focusedPreview === 'link' && ringStyle === 'double' && haloColor
                  ? `0 0 0 ${ringOffset + ringWidth + 2}px ${haloColor}`
                  : 'none',
              }"
              @focus="focusedPreview = 'link'"
              @blur="focusedPreview = null"
              @click.prevent
            >
              Read more about this
            </a>
          </div>

          <p class="caption mt-4 normal-case tracking-normal text-ink-muted">
            Tab through the elements above to see the focus ring in action.
          </p>

          <!-- Contrast verdict -->
          <div class="mt-8 border-t border-ink pt-6">
            <p class="caption">Ring contrast against background</p>
            <p class="mt-3 font-display text-cover leading-none tabular-nums">
              {{ formatRatio(ringContrast) }}
            </p>
            <div class="mt-4">
              <StatusBadge
                :passes="ringPassesUiContrast"
                label="Non-text contrast"
                :detail="`3:1 — SC 1.4.11 ${ringPassesUiContrast ? 'met' : 'not met'}`"
              />
            </div>
            <div v-if="haloContrast !== null" class="mt-4">
              <p class="caption normal-case tracking-normal text-ink-muted">
                Halo-to-ring contrast: {{ formatRatio(haloContrast) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="ring-export-heading" class="gutter mt-section">
      <h2 id="ring-export-heading" class="caption">Export</h2>

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
          {{ saved ? 'Saved' : 'Save to token schema' }}
        </button>
      </div>

      <div class="mt-6">
        <CodeBlock
          :code="cssOutput"
          label="CSS :focus-visible"
          copy-label="Copy CSS"
          message="Focus ring CSS copied"
        />
      </div>
    </section>

    <ToolStatus :text="statusText" />

    <ToolReference slug="focus-ring-generator" />

    <ToolFooterNav slug="focus-ring-generator" />
  </div>
</template>
