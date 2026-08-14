<script setup lang="ts">
import type { FontPairing } from '~/utils/tools/fonts'
import type { ToggleOption } from '~/types/tools'
import type { DeliveryMethod, Framework, CodeOptions } from '~/utils/tools/font-pairing-code'
import {
  googleFontsLinkTags,
  selfHostedCss,
  frameworkSnippet,
  copyAllCode,
  fontFilesForPairing,
  canUseVariable,
  headingHasItalic,
  bodyHasItalic,
  availableWeights,
  defaultWeights,
  WEIGHT_LABELS,
} from '~/utils/tools/font-pairing-code'

const props = defineProps<{
  pairing: FontPairing
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// ---------------------------------------------------------------------------
// Refs
// ---------------------------------------------------------------------------

const panelRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

const delivery = ref<DeliveryMethod>('cdn')
const framework = ref<Framework>('html')
const fontPath = ref('../fonts/')

const useVariable = ref(false)
const headingItalic = ref(false)
const bodyItalic = ref(false)

const headingWeights = ref<number[]>([])
const bodyWeights = ref<number[]>([])

const headingAvailable = computed(() => availableWeights(props.pairing.heading))
const bodyAvailable = computed(() => availableWeights(props.pairing.body))

watch(
  () => props.pairing.id,
  () => {
    headingWeights.value = defaultWeights(props.pairing.heading)
    bodyWeights.value = defaultWeights(props.pairing.body)
    useVariable.value = false
    headingItalic.value = false
    bodyItalic.value = false
  },
  { immediate: true },
)

function toggleWeight(role: 'heading' | 'body', weight: number) {
  const list = role === 'heading' ? headingWeights : bodyWeights
  const idx = list.value.indexOf(weight)
  if (idx >= 0) {
    if (list.value.length > 1) list.value = list.value.filter((w) => w !== weight)
  } else {
    list.value = [...list.value, weight].sort((a, b) => a - b)
  }
}

const showVariableToggle = computed(() => canUseVariable(props.pairing))
const showHeadingItalic = computed(() => headingHasItalic(props.pairing))
const showBodyItalic = computed(() => bodyHasItalic(props.pairing))

const codeOptions = computed<CodeOptions>(() => ({
  useVariable: useVariable.value && showVariableToggle.value,
  headingItalic: headingItalic.value && showHeadingItalic.value,
  bodyItalic: bodyItalic.value && showBodyItalic.value,
  headingWeights: headingWeights.value,
  bodyWeights: bodyWeights.value,
}))

// ---------------------------------------------------------------------------
// Focus trap
// ---------------------------------------------------------------------------

const isOpen = computed(() => props.open)

useFocusTrap(panelRef, isOpen, {
  returnTo: triggerRef,
  onEscape: () => emit('close'),
})

// ---------------------------------------------------------------------------
// Delivery method toggle
// ---------------------------------------------------------------------------

const deliveryOptions: ToggleOption[] = [
  { value: 'cdn', label: 'Google Fonts CDN' },
  { value: 'self-hosted', label: 'Self-hosted' },
]

// ---------------------------------------------------------------------------
// Framework tabs
// ---------------------------------------------------------------------------

const frameworks: { value: Framework; label: string }[] = [
  { value: 'html', label: 'HTML / CSS' },
  { value: 'nuxt', label: 'Nuxt 3' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'vite', label: 'Vite' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'astro', label: 'Astro' },
]

// ---------------------------------------------------------------------------
// IDs for ARIA
// ---------------------------------------------------------------------------

const titleId = useId()
const pathLabelId = useId()
const tabIds = frameworks.map(() => useId())
const panelIds = frameworks.map(() => useId())

// ---------------------------------------------------------------------------
// Active tab index for arrow-key navigation
// ---------------------------------------------------------------------------

const activeTabIndex = computed(() => frameworks.findIndex((f) => f.value === framework.value))

function onTabKeydown(e: KeyboardEvent) {
  let next = activeTabIndex.value
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    next = (next + 1) % frameworks.length
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    next = (next - 1 + frameworks.length) % frameworks.length
  } else if (e.key === 'Home') {
    e.preventDefault()
    next = 0
  } else if (e.key === 'End') {
    e.preventDefault()
    next = frameworks.length - 1
  } else {
    return
  }
  framework.value = frameworks[next].value
  nextTick(() => {
    const tab = panelRef.value?.querySelector<HTMLElement>(`#${tabIds[next]}`)
    tab?.focus()
  })
}

// ---------------------------------------------------------------------------
// Computed snippets
// ---------------------------------------------------------------------------

const activeSnippet = computed(() =>
  frameworkSnippet(props.pairing, delivery.value, framework.value, fontPath.value, codeOptions.value),
)

const cdnLinkTags = computed(() => googleFontsLinkTags(props.pairing, codeOptions.value))
const selfHostedBlock = computed(() => selfHostedCss(props.pairing, fontPath.value, codeOptions.value))

const allCode = computed(() =>
  copyAllCode(props.pairing, delivery.value, framework.value, fontPath.value, codeOptions.value),
)

// ---------------------------------------------------------------------------
// Font download
// ---------------------------------------------------------------------------

const downloading = ref(false)

async function downloadFonts() {
  downloading.value = true
  try {
    const files = fontFilesForPairing(props.pairing, codeOptions.value)
    const fontUrls = findFontFileUrls(props.pairing)

    if (fontUrls.length === 0) {
      const { push } = useToast()
      push('Could not locate font files for download. Copy the CSS and download fonts from fontsource.org.', 'error')
      return
    }

    const zip = await createFontZip(fontUrls, files)
    const slug = `${props.pairing.heading.family.toLowerCase().replace(/\s+/g, '-')}-${props.pairing.body.family.toLowerCase().replace(/\s+/g, '-')}`
    triggerDownload(zip, `${slug}-fonts.zip`)
  } catch {
    const { push } = useToast()
    push('Font download failed. Try downloading from fontsource.org directly.', 'error')
  } finally {
    downloading.value = false
  }
}

function findFontFileUrls(pairing: FontPairing): { url: string; fileName: string }[] {
  const results: { url: string; fileName: string }[] = []
  const families = [pairing.heading, pairing.body]
  const weights = new Map<string, Set<number>>()

  for (const face of families) {
    const set = weights.get(face.family) ?? new Set<number>()
    set.add(400)
    set.add(face.weight)
    weights.set(face.family, set)
  }

  try {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (!(rule instanceof CSSFontFaceRule)) continue
          const ruleFamily = rule.style.getPropertyValue('font-family').replace(/['"]/g, '').trim()
          const ruleWeight = Number(rule.style.getPropertyValue('font-weight').trim())
          const targetWeights = weights.get(ruleFamily)
          if (!targetWeights?.has(ruleWeight)) continue

          const src = rule.style.getPropertyValue('src')
          const match = src.match(/url\(["']?([^"')]+\.woff2)["']?\)/)
          if (match) {
            const slug = ruleFamily.toLowerCase().replace(/\s+/g, '-')
            const weightLabel = ruleWeight === 400 ? 'regular' : String(ruleWeight)
            results.push({
              url: match[1],
              fileName: `${slug}-v1-latin-${weightLabel}.woff2`,
            })
            targetWeights.delete(ruleWeight)
          }
        }
      } catch {
        // Cross-origin stylesheet — skip
      }
    }
  } catch {
    // Stylesheet access failed
  }

  return results
}

async function createFontZip(
  fontUrls: { url: string; fileName: string }[],
  _files: { family: string; weight: number; fileName: string }[],
): Promise<Blob> {
  const fetches = await Promise.all(
    fontUrls.map(async (entry) => {
      const res = await fetch(entry.url)
      const data = await res.arrayBuffer()
      return { name: entry.fileName, data: new Uint8Array(data) }
    }),
  )

  return buildZipBlob(fetches)
}

/** Minimal ZIP builder for STORE (no compression). woff2 is already compressed. */
function buildZipBlob(files: { name: string; data: Uint8Array }[]): Blob {
  const encoder = new TextEncoder()
  const parts: Uint8Array[] = []
  const centralDir: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const nameBytes = encoder.encode(file.name)
    // Local file header
    const localHeader = new ArrayBuffer(30 + nameBytes.length)
    const lv = new DataView(localHeader)
    lv.setUint32(0, 0x04034b50, true) // signature
    lv.setUint16(4, 20, true) // version needed
    lv.setUint16(6, 0, true) // flags
    lv.setUint16(8, 0, true) // compression: STORE
    lv.setUint16(10, 0, true) // mod time
    lv.setUint16(12, 0, true) // mod date
    lv.setUint32(14, crc32(file.data), true)
    lv.setUint32(18, file.data.length, true) // compressed size
    lv.setUint32(22, file.data.length, true) // uncompressed size
    lv.setUint16(26, nameBytes.length, true)
    lv.setUint16(28, 0, true) // extra length
    new Uint8Array(localHeader).set(nameBytes, 30)

    const localHeaderBytes = new Uint8Array(localHeader)
    parts.push(localHeaderBytes, file.data)

    // Central directory entry
    const cdEntry = new ArrayBuffer(46 + nameBytes.length)
    const cv = new DataView(cdEntry)
    cv.setUint32(0, 0x02014b50, true) // signature
    cv.setUint16(4, 20, true) // version made by
    cv.setUint16(6, 20, true) // version needed
    cv.setUint16(8, 0, true) // flags
    cv.setUint16(10, 0, true) // compression
    cv.setUint16(12, 0, true) // mod time
    cv.setUint16(14, 0, true) // mod date
    cv.setUint32(16, crc32(file.data), true)
    cv.setUint32(20, file.data.length, true)
    cv.setUint32(24, file.data.length, true)
    cv.setUint16(28, nameBytes.length, true)
    cv.setUint16(30, 0, true) // extra length
    cv.setUint16(32, 0, true) // comment length
    cv.setUint16(34, 0, true) // disk number
    cv.setUint16(36, 0, true) // internal attrs
    cv.setUint32(38, 0, true) // external attrs
    cv.setUint32(42, offset, true) // local header offset
    new Uint8Array(cdEntry).set(nameBytes, 46)

    centralDir.push(new Uint8Array(cdEntry))
    offset += localHeaderBytes.length + file.data.length
  }

  const cdOffset = offset
  let cdSize = 0
  for (const entry of centralDir) {
    parts.push(entry)
    cdSize += entry.length
  }

  // End of central directory
  const eocd = new ArrayBuffer(22)
  const ev = new DataView(eocd)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(4, 0, true) // disk number
  ev.setUint16(6, 0, true) // disk with CD
  ev.setUint16(8, files.length, true)
  ev.setUint16(10, files.length, true)
  ev.setUint32(12, cdSize, true)
  ev.setUint32(16, cdOffset, true)
  ev.setUint16(20, 0, true) // comment length
  parts.push(new Uint8Array(eocd))

  return new Blob(parts as BlobPart[], { type: 'application/zip' })
}

/** CRC-32 (used by ZIP). Computed from a lookup table. */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  if (!crc32Table) crc32Table = buildCrc32Table()
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ data[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

let crc32Table: Uint32Array | null = null

function buildCrc32Table(): Uint32Array {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c >>> 0
  }
  return table
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Body scroll lock
// ---------------------------------------------------------------------------

watch(isOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})

// ---------------------------------------------------------------------------
// Expose triggerRef so the parent can set it
// ---------------------------------------------------------------------------

defineExpose({ triggerRef })
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-editorial"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-200 ease-editorial"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-ink/20"
        aria-hidden="true"
        @click="emit('close')"
      />
    </Transition>

    <Transition
      enter-active-class="transition-[translate] duration-300 ease-editorial"
      enter-from-class="translate-x-full max-md:translate-x-0 max-md:translate-y-full"
      leave-active-class="transition-[translate] duration-200 ease-editorial"
      leave-to-class="translate-x-full max-md:translate-x-0 max-md:translate-y-full"
    >
      <aside
        v-if="open"
        ref="panelRef"
        role="dialog"
        :aria-labelledby="titleId"
        aria-modal="true"
        class="fixed z-50 overflow-y-auto bg-paper shadow-xl
               max-md:inset-x-0 max-md:bottom-0 max-md:top-12 max-md:border-t max-md:border-ink
               md:inset-y-0 md:right-0 md:w-[min(42rem,100vw-2rem)] md:border-l md:border-ink"
      >
        <!-- ============================================================= -->
        <!-- 1. Summary header                                              -->
        <!-- ============================================================= -->
        <header class="sticky top-0 z-10 border-b border-rule bg-paper px-6 py-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 :id="titleId" class="text-[1.125rem] font-bold leading-tight text-ink">
                {{ pairing.heading.family }} + {{ pairing.body.family }}
              </h2>
              <p class="mt-1 text-[0.9375rem] text-ink-muted">{{ pairing.mood }} pairing</p>
            </div>
            <button
              type="button"
              class="caption flex size-10 shrink-0 items-center justify-center border border-rule text-ink transition-colors hover:border-ink"
              aria-label="Close panel"
              @click="emit('close')"
            >
              <span aria-hidden="true" class="text-[1.25rem] leading-none">✕</span>
            </button>
          </div>

          <dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[0.875rem]">
            <div>
              <dt class="caption">Heading</dt>
              <dd
                class="mt-0.5 text-ink"
                :style="{ fontStyle: headingItalic && showHeadingItalic ? 'italic' : 'normal' }"
              >
                {{ pairing.heading.family }} · {{ pairing.heading.weight }}
              </dd>
            </div>
            <div>
              <dt class="caption">Body</dt>
              <dd
                class="mt-0.5 text-ink"
                :style="{ fontStyle: bodyItalic && showBodyItalic ? 'italic' : 'normal' }"
              >
                {{ pairing.body.family }} · {{ pairing.body.weight }}
              </dd>
            </div>
          </dl>

          <div v-if="!codeOptions.useVariable" class="mt-4 space-y-3">
            <div>
              <p class="text-[0.75rem] font-medium uppercase tracking-wider text-ink-muted">Heading weights</p>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  v-for="w in headingAvailable"
                  :key="w"
                  type="button"
                  class="inline-flex min-w-[3.25rem] items-center justify-center border px-2 py-1 font-mono text-[0.75rem] leading-tight transition-colors"
                  :class="headingWeights.includes(w)
                    ? 'border-ink bg-ink text-paper'
                    : 'border-rule text-ink-muted hover:border-ink hover:text-ink'"
                  :aria-pressed="headingWeights.includes(w)"
                  :title="WEIGHT_LABELS[w] ?? String(w)"
                  @click="toggleWeight('heading', w)"
                >
                  {{ w }}
                </button>
              </div>
            </div>

            <div>
              <p class="text-[0.75rem] font-medium uppercase tracking-wider text-ink-muted">Body weights</p>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  v-for="w in bodyAvailable"
                  :key="w"
                  type="button"
                  class="inline-flex min-w-[3.25rem] items-center justify-center border px-2 py-1 font-mono text-[0.75rem] leading-tight transition-colors"
                  :class="bodyWeights.includes(w)
                    ? 'border-ink bg-ink text-paper'
                    : 'border-rule text-ink-muted hover:border-ink hover:text-ink'"
                  :aria-pressed="bodyWeights.includes(w)"
                  :title="WEIGHT_LABELS[w] ?? String(w)"
                  @click="toggleWeight('body', w)"
                >
                  {{ w }}
                </button>
              </div>
            </div>
          </div>

          <p v-else class="mt-4 text-[0.8125rem] text-ink-muted">
            Variable font — single file covers all weights in the range.
          </p>

          <fieldset class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-0 p-0">
            <legend class="caption mb-1 w-full">Options</legend>

            <label
              v-if="showVariableToggle"
              class="inline-flex cursor-pointer items-center gap-2 text-[0.8125rem] text-ink"
            >
              <input
                v-model="useVariable"
                type="checkbox"
                class="size-4 accent-ink"
              />
              Variable font
            </label>

            <label
              v-if="showHeadingItalic"
              class="inline-flex cursor-pointer items-center gap-2 text-[0.8125rem] text-ink"
            >
              <input
                v-model="headingItalic"
                type="checkbox"
                class="size-4 accent-ink"
              />
              Heading italic
            </label>

            <label
              v-if="showBodyItalic"
              class="inline-flex cursor-pointer items-center gap-2 text-[0.8125rem] text-ink"
            >
              <input
                v-model="bodyItalic"
                type="checkbox"
                class="size-4 accent-ink"
              />
              Body italic
            </label>
          </fieldset>
        </header>

        <div class="space-y-10 px-6 py-8">
          <!-- ============================================================= -->
          <!-- 2. Delivery method toggle                                      -->
          <!-- ============================================================= -->
          <section aria-label="Delivery method">
            <ToolToggle
              v-model="delivery"
              :options="deliveryOptions"
              label="Delivery method"
            />

            <!-- CDN content -->
            <div v-if="delivery === 'cdn'" class="mt-6 space-y-5">
              <div class="border-t border-rule pt-4">
                <div class="flex items-start justify-between gap-4">
                  <p class="caption pt-1">Link tags</p>
                  <CopyButton
                    :value="cdnLinkTags"
                    label="Copy"
                    :message="`Google Fonts link tags copied`"
                  />
                </div>
                <pre class="mt-3 overflow-x-auto py-2 font-mono text-[0.8125rem] leading-relaxed text-ink" tabindex="0"><code>{{ cdnLinkTags }}</code></pre>
              </div>

              <aside class="border-l-2 border-blue py-1 pl-4 text-[0.875rem] leading-snug text-ink-muted" role="note">
                <p>
                  <strong class="text-ink">Privacy note:</strong> Google Fonts served from Google's
                  CDN sends visitor IP addresses to Google on every page load. A 2022 Munich Regional
                  Court ruling found this can violate GDPR without consent for EU visitors.
                </p>
                <p class="mt-2">
                  If your audience is in the EU, <strong class="text-ink">self-hosting avoids needing
                  a cookie/consent banner for font loading</strong>. Both Nuxt&nbsp;3 and Next.js can
                  self-host Google Fonts automatically at build time — see the framework tabs below.
                </p>
              </aside>
            </div>

            <!-- Self-hosted content -->
            <div v-if="delivery === 'self-hosted'" class="mt-6 space-y-5">
              <div>
                <button
                  type="button"
                  class="caption inline-flex min-h-11 items-center justify-center gap-2 border border-ink bg-ink px-4 py-2 normal-case tracking-normal text-paper transition-colors hover:border-blue hover:bg-blue"
                  :disabled="downloading"
                  @click="downloadFonts"
                >
                  <span aria-hidden="true" class="leading-none">{{ downloading ? '⏳' : '↓' }}</span>
                  <span>{{ downloading ? 'Downloading…' : 'Download font files' }}</span>
                </button>
                <p class="mt-2 text-[0.8125rem] text-ink-muted">
                  .woff2 files for the selected weights, packaged as a zip.
                </p>
              </div>

              <div>
                <label :for="pathLabelId" class="caption block">Font folder prefix</label>
                <input
                  :id="pathLabelId"
                  v-model="fontPath"
                  type="text"
                  spellcheck="false"
                  autocomplete="off"
                  class="mt-2 w-full border-b border-rule bg-transparent py-2 font-mono text-[0.875rem] text-ink outline-none transition-colors focus:border-ink"
                  placeholder="../fonts/"
                />
                <p class="mt-1 text-[0.8125rem] text-ink-muted">
                  Every <code class="font-mono">url(…)</code> path below updates as you type.
                </p>
              </div>

              <div class="border-t border-rule pt-4">
                <div class="flex items-start justify-between gap-4">
                  <p class="caption pt-1">@font-face blocks</p>
                  <CopyButton
                    :value="selfHostedBlock"
                    label="Copy"
                    :message="`@font-face CSS copied`"
                  />
                </div>
                <pre class="mt-3 overflow-x-auto py-2 font-mono text-[0.8125rem] leading-relaxed text-ink" tabindex="0"><code>{{ selfHostedBlock }}</code></pre>
              </div>

              <p class="text-[0.8125rem] leading-snug text-ink-muted">
                <code class="font-mono">font-display:&nbsp;swap</code> shows text immediately in
                a fallback font, then swaps to the web font once loaded — prevents invisible text
                during load.
              </p>
            </div>
          </section>

          <!-- ============================================================= -->
          <!-- 3. Framework-specific tabs                                     -->
          <!-- ============================================================= -->
          <section aria-labelledby="framework-heading">
            <h3 id="framework-heading" class="caption mb-4">How to use in your project</h3>

            <div role="tablist" aria-label="Framework" class="flex border-b border-rule">
              <button
                v-for="(fw, index) in frameworks"
                :id="tabIds[index]"
                :key="fw.value"
                type="button"
                role="tab"
                :aria-selected="framework === fw.value"
                :aria-controls="panelIds[index]"
                :tabindex="framework === fw.value ? 0 : -1"
                class="caption -mb-px border-b-2 px-3 py-2.5 normal-case tracking-normal transition-colors"
                :class="
                  framework === fw.value
                    ? 'border-ink text-ink font-bold'
                    : 'border-transparent text-ink-muted hover:text-ink'
                "
                @click="framework = fw.value"
                @keydown="onTabKeydown"
              >
                {{ fw.label }}
              </button>
            </div>

            <div
              v-for="(fw, index) in frameworks"
              :id="panelIds[index]"
              :key="fw.value"
              role="tabpanel"
              :aria-labelledby="tabIds[index]"
              :hidden="framework !== fw.value"
              :tabindex="framework === fw.value ? 0 : -1"
              class="mt-4"
            >
              <div v-if="framework === fw.value">
                <div class="flex items-start justify-between gap-4">
                  <p class="caption pt-1">{{ fw.label }}</p>
                  <CopyButton
                    :value="activeSnippet"
                    label="Copy"
                    :message="`${fw.label} snippet copied`"
                  />
                </div>
                <pre class="mt-3 overflow-x-auto py-2 font-mono text-[0.8125rem] leading-relaxed text-ink" tabindex="0"><code>{{ activeSnippet }}</code></pre>
              </div>
            </div>
          </section>

          <!-- ============================================================= -->
          <!-- 4. Footer actions                                              -->
          <!-- ============================================================= -->
          <footer class="flex items-center gap-3 border-t border-ink pt-6">
            <CopyButton
              :value="allCode"
              label="Copy all code"
              variant="solid"
              :message="`All code for ${pairing.heading.family} + ${pairing.body.family} copied`"
            />
            <button
              type="button"
              class="caption inline-flex min-h-11 items-center justify-center gap-2 border border-rule px-4 py-2 normal-case tracking-normal text-ink transition-colors hover:border-ink"
              @click="emit('close')"
            >
              Close
            </button>
          </footer>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
