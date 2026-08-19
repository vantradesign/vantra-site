<script setup lang="ts">
import { analyzeAccessibilityFlow } from '@vantra-design/screenreader-empathy/core'
import type { TraversalResult, TraversalEntry } from '@vantra-design/screenreader-empathy/core'
import {
  getStructureReport,
  buildNarrative,
  formatAnnouncement,
  nameDisplay,
  groupEntriesByLandmark,
  exportMarkdown,
  FIX_SUGGESTIONS,
} from '~/utils/empathy/structure-report'
import type { StructureReport, HeadingNode, ReadingGroup } from '~/utils/empathy/structure-report'

definePageMeta({ layout: 'fullscreen' })

useToolPageSeo({
  slug: 'screenreader-empathy',
  title: 'Screenreader Empathy — hear what your page sounds like',
  description:
    'Paste HTML and see the reading order, heading outline, landmark map and accessibility issues a screen reader user would encounter. Nothing leaves the browser.',
})

// ── Sample HTML ──

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>My Portfolio</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <header>
    <nav aria-label="Main">
      <a href="/">Home</a>
      <a href="/work">Work</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>

  <main>
    <h1>Welcome to my portfolio</h1>
    <p>I'm a designer who cares about accessibility.</p>

    <h2>Recent work</h2>
    <div>
      <a href="/project-alpha"><img src="alpha.jpg"></a>
      <a href="/project-alpha">Project Alpha</a>
    </div>
    <div>
      <a href="/project-beta"><img src="beta.jpg" alt="Beta project screenshot"></a>
      <a href="/project-beta">Project Beta</a>
    </div>

    <h2>Testimonials</h2>
    <blockquote>"Great work!" — Client A</blockquote>
    <blockquote>"Fantastic results." — Client B</blockquote>

    <h2>Get in touch</h2>
    <form>
      <label for="name">Name</label>
      <input type="text" id="name">
      <label for="email">Email</label>
      <input type="email" id="email">
      <textarea placeholder="Your message"></textarea>
    </form>
  </main>

  <footer>
    <p>&copy; 2026 My Portfolio</p>
    <a href="#">click here</a> for more info.
  </footer>
</body>
</html>`

// ── State ──

const inputHtml = ref('')
const fetchUrl = ref('')
const fetchStatus = ref('')
const fetchError = ref(false)
const fetching = ref(false)
const result = ref<TraversalResult | null>(null)
const report = ref<StructureReport | null>(null)
const activeTab = ref<'ia' | 'sr'>('ia')
const error = ref('')
const exportedLabel = ref('')
const previewIframe = ref<HTMLIFrameElement | null>(null)
const previewContainer = ref<HTMLElement | null>(null)

function loadSample() {
  inputHtml.value = SAMPLE_HTML
}

async function fetchFromUrl() {
  const url = fetchUrl.value.trim()
  if (!url) return

  fetching.value = true
  fetchStatus.value = 'Fetching\u2026'
  fetchError.value = false

  try {
    const data = await $fetch<{ html: string; url: string }>('/api/fetch-url', {
      query: { url },
    })
    inputHtml.value = data.html
    fetchStatus.value = `Fetched ${data.html.length.toLocaleString()} chars \u2014 click Analyze`
    fetchError.value = false
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Fetch failed'
    fetchStatus.value = msg
    fetchError.value = true
  } finally {
    fetching.value = false
  }
}

function analyze() {
  const html = inputHtml.value.trim()
  if (!html) return
  error.value = ''
  try {
    const r = analyzeAccessibilityFlow(html)
    const s = getStructureReport(r)
    result.value = r
    report.value = s
    nextTick(() => injectPreview(html, r, s))
  } catch (err) {
    error.value = (err as Error).message
    result.value = null
    report.value = null
  }
}

// ── Preview iframe ──

const PREVIEW_VIEWPORT_H = 800

/**
 * Rewrite viewport-height units (vh, dvh, svh, lvh) to fixed px so they
 * resolve against our simulated viewport, not the iframe's actual height.
 * Without this, 100vh grows the iframe → re-resolves vh → runaway loop.
 */
function rewriteVhUnits(text: string): string {
  return text.replace(
    /(\d+(?:\.\d+)?)\s*(vh|dvh|svh|lvh)\b/gi,
    (_m, val) => {
      const px = (parseFloat(val) / 100) * PREVIEW_VIEWPORT_H
      return `${Number.isInteger(px) ? px : px.toFixed(2)}px`
    },
  )
}

/** Rewrite vh units inside all inline style="" attributes and <style> blocks. */
function rewriteHtmlVh(html: string): string {
  // Inline style="…" attributes
  html = html.replace(
    /style\s*=\s*(['"])([\s\S]*?)\1/gi,
    (_m, q, style) => `style=${q}${rewriteVhUnits(style)}${q}`,
  )

  // <style> blocks
  html = html.replace(
    /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (_m, open, css, close) => `${open}${rewriteVhUnits(css)}${close}`,
  )

  return html
}

function injectPreview(html: string, r: TraversalResult, s: StructureReport) {
  const iframe = previewIframe.value
  if (!iframe) return

  const doc = iframe.contentDocument
  if (!doc) return

  const safeHtml = rewriteHtmlVh(html)

  doc.open()
  doc.write(safeHtml)
  doc.close()

  const VIEWPORT_H = 800
  const MAX_HEIGHT = VIEWPORT_H * 10
  iframe.style.height = `${VIEWPORT_H}px`

  let lastHeight = 0
  let stableCount = 0

  const finalise = () => {
    const body = doc.body
    const docEl = doc.documentElement
    const measured = body && docEl
      ? Math.max(body.scrollHeight, docEl.scrollHeight)
      : VIEWPORT_H
    const finalHeight = Math.min(Math.max(measured, VIEWPORT_H), MAX_HEIGHT)
    iframe.style.height = `${finalHeight}px`
    requestAnimationFrame(() => drawOverlays(iframe, r, s))
  }

  const resizeInterval = setInterval(() => {
    const body = doc.body
    const docEl = doc.documentElement
    if (!body || !docEl) return

    const contentHeight = Math.max(body.scrollHeight, docEl.scrollHeight)
    if (contentHeight === lastHeight) {
      stableCount++
    } else {
      stableCount = 0
      lastHeight = contentHeight
    }

    if (stableCount >= 5) {
      clearInterval(resizeInterval)
      finalise()
    }
  }, 300)

  setTimeout(() => {
    clearInterval(resizeInterval)
    finalise()
  }, 8000)
}

function drawOverlays(iframe: HTMLIFrameElement, r: TraversalResult, s: StructureReport) {
  const doc = iframe.contentDocument
  if (!doc) return

  const container = previewContainer.value
  if (!container) return

  container.querySelectorAll('.overlay-marker').forEach(el => el.remove())

  const iframeRect = iframe.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  // Landmark overlays
  for (const lm of s.landmarks) {
    try {
      const el = doc.querySelector(lm.selector)
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue

      const marker = document.createElement('div')
      marker.className = 'overlay-marker overlay-landmark'
      marker.textContent = lm.label ? `${lm.role}: ${lm.label}` : lm.role
      marker.style.top = `${rect.top + (iframeRect.top - containerRect.top)}px`
      marker.style.left = `${rect.left + (iframeRect.left - containerRect.left)}px`
      container.appendChild(marker)
    } catch { /* selector may not match */ }
  }

  // Heading overlays
  for (const entry of r.entries) {
    if (entry.role !== 'heading') continue
    try {
      const el = doc.querySelector(entry.selector)
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue

      const marker = document.createElement('div')
      marker.className = 'overlay-marker overlay-heading'
      marker.textContent = `h${entry.level ?? '?'}`
      marker.style.top = `${rect.top + (iframeRect.top - containerRect.top)}px`
      marker.style.right = `${containerRect.right - (rect.right + (iframeRect.left - containerRect.left))}px`
      marker.style.left = 'auto'
      container.appendChild(marker)
    } catch { /* selector may not match */ }
  }

  // Flag overlays
  for (const entry of r.entries) {
    if (entry.flags.length === 0) continue
    try {
      const el = doc.querySelector(entry.selector)
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue

      const marker = document.createElement('div')
      marker.className = 'overlay-marker overlay-flag'
      marker.textContent = entry.flags.length > 1 ? `${entry.flags.length} issues` : entry.flags[0].code
      marker.title = entry.flags.map(f => f.message).join('\n')
      marker.style.top = `${rect.bottom + (iframeRect.top - containerRect.top) - 4}px`
      marker.style.left = `${rect.left + (iframeRect.left - containerRect.left)}px`
      container.appendChild(marker)
    } catch { /* selector may not match */ }
  }
}

// ── Derived ──

const scoreColor = computed(() => {
  if (!report.value) return ''
  if (report.value.score >= 70) return 'var(--color-pass)'
  if (report.value.score >= 50) return 'var(--color-ink-muted)'
  return 'var(--color-fail)'
})

const narrative = computed(() => {
  if (!result.value || !report.value) return []
  return buildNarrative(result.value, report.value)
})

const readingGroups = computed<ReadingGroup[]>(() => {
  if (!result.value || !report.value) return []
  return groupEntriesByLandmark(result.value, report.value)
})

function doExport() {
  if (!result.value || !report.value) return
  const md = exportMarkdown(result.value, report.value)
  navigator.clipboard.writeText(md).then(() => {
    exportedLabel.value = 'Copied!'
    setTimeout(() => { exportedLabel.value = '' }, 2000)
  })
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
</script>

<template>
  <div class="flex h-screen flex-col">
    <!-- Top bar -->
    <header class="sticky top-0 z-40 flex items-center justify-between border-b border-rule bg-paper px-4 py-2 sm:px-6">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/tools"
          class="caption transition-colors duration-300 ease-editorial hover:text-ink"
          aria-label="Back to tools"
        >
          &larr; Tools
        </NuxtLink>
        <span class="hidden text-rule sm:inline">|</span>
        <span class="hidden font-display text-[1rem] font-700 tracking-tight sm:inline">Screenreader Empathy</span>
      </div>
      <NuxtLink to="/" class="block" aria-label="Vantra — home">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 149.61 39.73" class="h-7" fill="currentColor" aria-hidden="true">
          <path d="M0,12.65h2.08l9.05,24.99,8.79-24.99h1.97l-9.58,27.08h-2.5L0,12.65Z" />
          <path d="M31.44,12.65h2.8l9.73,27.08h-2.12l-2.99-8.29h-12.19l-2.95,8.29h-2.01l9.73-27.08ZM27.27,29.73h10.98l-5.49-15.34-5.49,15.34Z" />
          <path d="M48.42,12.65h2.88l15.15,24.16V12.65h2.01v27.08h-2.5l-15.49-24.73v24.73h-2.04V12.65Z" />
          <path d="M81.26,14.4h-8.41v-1.74h18.9v1.74h-8.41v25.34h-2.08V14.4Z" />
          <path d="M96.12,12.65h7.42c5.26,0,9.2,2.04,9.2,7.27v.15c0,4.51-2.95,6.59-7.01,7.16l8.6,12.5h-2.35l-8.48-12.35h-5.26v12.35h-2.12V12.65ZM103.66,25.68c4.35,0,6.97-1.67,6.97-5.6v-.15c0-4.17-2.76-5.53-6.97-5.53h-5.42v11.29h5.42Z" />
          <path d="M127.51,12.65h2.8l9.73,27.08h-2.12l-2.99-8.29h-12.19l-2.95,8.29h-2.01l9.73-27.08ZM123.35,29.73h10.98l-5.49-15.34-5.49,15.34Z" />
          <polygon points="149.61 8.05 142.52 15.14 142.04 7.57 134.47 7.1 141.57 0 149.14 .47 149.61 8.05" fill="#021f94" />
        </svg>
      </NuxtLink>
    </header>

    <!-- Main content -->
    <div class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-[1440px] p-[clamp(1.25rem,4vw,3rem)]">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="font-display text-display">Screenreader Empathy</h1>
          <p class="mt-2 max-w-[60ch] text-ink-muted">
            Paste HTML or enter a URL to see the reading order, structure report, and flagged issues a screen reader user would encounter.
          </p>
        </div>

        <!-- Input panel -->
        <div class="mb-10 flex flex-col gap-4">
          <div>
            <label for="url-input" class="caption">Fetch from URL</label>
            <div class="mt-1.5 flex gap-2">
              <input
                id="url-input"
                v-model="fetchUrl"
                type="url"
                class="panel flex-1 px-4 py-2 font-mono text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-blue"
                placeholder="https://example.com"
                @keydown.enter="fetchFromUrl"
              />
              <button class="btn btn-quiet" :disabled="fetching" @click="fetchFromUrl">
                {{ fetching ? 'Fetching\u2026' : 'Fetch' }}
              </button>
            </div>
            <p
              v-if="fetchStatus"
              class="mt-1.5 text-[0.8125rem]"
              :class="fetchError ? 'text-fail' : 'text-ink-muted'"
            >
              {{ fetchStatus }}
            </p>
          </div>

          <div>
            <label for="html-input" class="caption">HTML Input</label>
            <textarea
              id="html-input"
              v-model="inputHtml"
              class="panel mt-1.5 min-h-[200px] w-full resize-y p-4 font-mono text-[0.8125rem] leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue"
              spellcheck="false"
              placeholder="<!DOCTYPE html>&#10;<html lang=&quot;en&quot;>&#10;  ..."
            />
          </div>

          <div class="flex flex-wrap gap-2">
            <button class="btn btn-solid" @click="analyze">Analyze</button>
            <button class="btn btn-quiet" @click="loadSample">Load Sample</button>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="panel mb-8 p-4">
          <p class="text-fail">Error: {{ error }}</p>
        </div>

        <!-- Empty state -->
        <div v-if="!result && !error" class="py-16 text-center text-ink-muted">
          <p class="font-display text-title">No results yet.</p>
          <p class="mt-2">Paste some HTML and click Analyze, or load the sample.</p>
        </div>

        <!-- Results dashboard -->
        <template v-if="result && report">
          <!-- Score strip -->
          <div class="panel mb-6 flex flex-wrap items-center gap-x-8 gap-y-4 p-5">
            <div class="flex items-center gap-4">
              <span class="font-display text-[2.5rem] font-700 leading-none tracking-tight" :style="{ color: scoreColor }">
                {{ report.score }}
              </span>
              <span
                class="inline-block border px-2.5 py-0.5 text-[0.8125rem] uppercase tracking-widest"
                :class="{
                  'border-pass text-pass': report.band === 'thorough' || report.band === 'solid',
                  'border-ink-muted text-ink-muted': report.band === 'basic',
                  'border-fail text-fail': report.band === 'minimal' || report.band === 'none',
                }"
              >
                {{ report.band }}
              </span>
            </div>

            <div class="min-w-[120px] flex-1">
              <div class="h-1 bg-surface">
                <div class="h-full transition-all duration-500 ease-editorial" :style="{ width: `${report.score}%`, background: scoreColor }" />
              </div>
            </div>

            <div class="flex flex-wrap gap-x-6 gap-y-1 text-[0.8125rem] text-ink-muted">
              <span><strong class="text-ink">{{ result.entries.length }}</strong> elements</span>
              <span><strong class="text-ink">{{ report.landmarks.length }}</strong> landmarks</span>
              <span><strong class="text-ink">{{ report.elementsBeforeMain }}</strong> before main</span>
              <span><strong class="text-ink">{{ report.orphanedContentPercent }}%</strong> orphaned</span>
              <span><strong class="text-ink">{{ report.issues.length }}</strong> issue{{ report.issues.length !== 1 ? 's' : '' }}</span>
            </div>

            <button class="btn btn-quiet ml-auto text-[0.75rem]" @click="doExport">
              {{ exportedLabel || 'Export \u2193' }}
            </button>
          </div>

          <!-- Page Preview -->
          <div class="panel mb-6 p-5">
            <div class="mb-3 flex items-center justify-between">
              <p class="caption">Page Preview</p>
              <div class="flex gap-4 text-[0.75rem] text-ink-muted">
                <span class="flex items-center gap-1"><span class="inline-block h-2.5 w-2.5 bg-blue opacity-70" /> Landmark</span>
                <span class="flex items-center gap-1"><span class="inline-block h-2.5 w-2.5 bg-pass opacity-70" /> Heading</span>
                <span class="flex items-center gap-1"><span class="inline-block h-2.5 w-2.5 bg-fail opacity-70" /> Issue</span>
              </div>
            </div>
            <div ref="previewContainer" class="relative max-h-[700px] overflow-auto border border-rule">
              <iframe
                ref="previewIframe"
                title="Page preview"
                class="block min-h-[400px] w-full border-none bg-white"
                style="pointer-events: none"
              />
            </div>
          </div>

          <!-- Tabs -->
          <div class="mb-6 flex border-b border-rule">
            <button
              class="px-5 py-2.5 text-[0.875rem] transition-colors duration-150"
              :class="activeTab === 'ia' ? 'border-b-2 border-ink text-ink' : 'border-b-2 border-transparent text-ink-muted hover:text-ink'"
              @click="activeTab = 'ia'"
            >
              IA &amp; Structure
            </button>
            <button
              class="px-5 py-2.5 text-[0.875rem] transition-colors duration-150"
              :class="activeTab === 'sr' ? 'border-b-2 border-ink text-ink' : 'border-b-2 border-transparent text-ink-muted hover:text-ink'"
              @click="activeTab = 'sr'"
            >
              Screen Reader Audit
            </button>
          </div>

          <!-- IA & Structure tab -->
          <div v-show="activeTab === 'ia'" class="flex flex-col gap-6">
            <!-- Narrative -->
            <div class="panel p-6">
              <p class="caption mb-4">Summary</p>
              <div class="space-y-2">
                <p v-for="(line, i) in narrative" :key="i" class="text-[0.9375rem] leading-relaxed">
                  {{ line }}
                </p>
              </div>
            </div>

            <!-- Issues + Structure -->
            <div class="grid gap-6 md:grid-cols-[1fr_380px]">
              <!-- Issues -->
              <div class="panel max-h-[600px] overflow-y-auto p-5">
                <p class="caption mb-4">Issues &amp; Fixes</p>
                <p v-if="report.issues.length === 0" class="text-ink-muted">No issues found.</p>
                <ul v-else class="flex flex-col">
                  <li
                    v-for="issue in report.issues"
                    :key="issue.code"
                    class="flex items-start gap-3 border-b border-rule py-3 text-[0.875rem] last:border-b-0"
                  >
                    <span
                      class="mt-0.5 shrink-0 border px-1.5 py-0.5 text-[0.6875rem] uppercase tracking-widest"
                      :class="{
                        'border-fail text-fail': issue.severity === 'critical' || issue.severity === 'serious',
                        'border-ink-muted text-ink-muted': issue.severity === 'moderate',
                        'border-rule text-ink-faint': issue.severity === 'minor',
                      }"
                    >
                      {{ issue.severity }}
                    </span>
                    <div class="min-w-0 flex-1">
                      <div>{{ issue.message }}</div>
                      <div v-if="FIX_SUGGESTIONS[issue.code]" class="mt-1 text-[0.8125rem] text-pass">
                        &rarr; {{ FIX_SUGGESTIONS[issue.code] }}
                      </div>
                      <div class="mt-0.5 font-mono text-[0.75rem] text-ink-faint">{{ issue.code }}</div>
                    </div>
                    <span v-if="issue.count > 1" class="shrink-0 text-[0.75rem] text-ink-muted">&times;{{ issue.count }}</span>
                  </li>
                </ul>
              </div>

              <!-- Structure sidebar -->
              <div class="flex flex-col gap-6">
                <!-- Heading outline -->
                <div class="panel p-5">
                  <p class="caption mb-4">Heading Outline</p>
                  <p v-if="report.headingTree.length === 0" class="text-ink-muted">No headings found.</p>
                  <EmpathyHeadingTree v-else :nodes="report.headingTree" />
                </div>

                <!-- Landmarks -->
                <div class="panel p-5">
                  <p class="caption mb-4">Landmarks</p>
                  <p v-if="report.landmarks.length === 0" class="text-ink-muted">No landmarks found.</p>
                  <ul v-else class="flex flex-col gap-1.5 text-[0.875rem]">
                    <li v-for="(lm, i) in report.landmarks" :key="i" class="flex items-center gap-2">
                      <span class="border border-rule px-1.5 py-0.5 font-mono text-[0.75rem] text-blue">{{ lm.role }}</span>
                      <span class="text-ink-muted">{{ lm.label || '(no label)' }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Screen Reader Audit tab -->
          <div v-show="activeTab === 'sr'">
            <div class="panel p-5">
              <div class="mb-4 flex items-center justify-between">
                <p class="caption">Reading Order</p>
                <span class="text-[0.8125rem] text-ink-muted">{{ result.entries.length }} entries</span>
              </div>

              <div v-for="group in readingGroups" :key="group.label" class="border-b border-rule last:border-b-0">
                <details open>
                  <summary class="flex cursor-pointer select-none items-center justify-between px-2 py-2.5 text-[0.8125rem]">
                    <span class="flex items-center gap-2 font-semibold">
                      <span v-if="group.role" class="border border-rule px-1.5 py-0.5 font-mono text-[0.75rem] font-normal text-blue">{{ group.role }}</span>
                      {{ group.label }}
                    </span>
                    <span class="text-[0.75rem] text-ink-faint">{{ group.entries.length }} entries</span>
                  </summary>

                  <!-- Column headers -->
                  <div class="flex gap-2 border-b border-ink px-2 py-1.5 text-[0.6875rem] uppercase tracking-widest text-ink-muted">
                    <span class="w-8 shrink-0 text-right">#</span>
                    <span class="w-20 shrink-0">Role</span>
                    <span class="min-w-0 flex-1">Name</span>
                    <span class="hidden min-w-0 flex-[1.5] pl-2 md:block">Screen reader hears</span>
                    <span class="w-8 shrink-0" />
                  </div>

                  <!-- Entries -->
                  <ol class="max-h-[600px] overflow-y-auto text-[0.8125rem]">
                    <li
                      v-for="entry in group.entries"
                      :key="entry.index"
                      class="flex items-baseline gap-2 border-b border-rule px-2 py-1.5 last:border-b-0"
                      :class="entry.flags.length > 0 ? 'border-l-[3px] border-l-fail' : ''"
                    >
                      <span class="w-8 shrink-0 text-right font-mono text-[0.6875rem] text-ink-faint">{{ entry.index }}</span>
                      <span class="w-20 shrink-0 font-mono text-[0.6875rem] text-blue">
                        {{ entry.role }}{{ entry.level ? ` (${entry.level})` : '' }}
                      </span>
                      <span class="min-w-0 flex-1 truncate">
                        <template v-if="nameDisplay(entry).style === 'normal'">{{ nameDisplay(entry).text }}</template>
                        <span v-else-if="nameDisplay(entry).style === 'structural'" class="italic text-ink-faint">{{ nameDisplay(entry).text }}</span>
                        <span v-else-if="nameDisplay(entry).style === 'missing'" class="text-[0.6875rem] uppercase tracking-wider text-fail">{{ nameDisplay(entry).text }}</span>
                        <span v-else class="text-ink-faint">{{ nameDisplay(entry).text }}</span>
                      </span>
                      <span class="hidden min-w-0 flex-[1.5] truncate border-l border-rule pl-2 text-[0.75rem] italic text-ink-muted md:block">
                        {{ formatAnnouncement(entry) }}
                      </span>
                      <span class="flex w-8 shrink-0 gap-1">
                        <span
                          v-for="(flag, fi) in entry.flags"
                          :key="fi"
                          class="inline-block h-2 w-2 rounded-full bg-fail"
                          :title="`${flag.code}: ${flag.message}`"
                        />
                      </span>
                    </li>
                  </ol>
                </details>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
.overlay-marker {
  position: absolute;
  z-index: 10;
  font-family: var(--font-mono);
  font-size: 0.5625rem;
  letter-spacing: 0.02em;
  padding: 0.125rem 0.375rem;
  white-space: nowrap;
  pointer-events: auto;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overlay-landmark {
  background: rgba(2, 31, 148, 0.85);
  color: white;
}

.overlay-heading {
  background: rgba(20, 88, 76, 0.85);
  color: white;
}

.overlay-flag {
  background: rgba(143, 29, 19, 0.85);
  color: white;
}
</style>
