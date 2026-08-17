<script setup lang="ts">
import {
  decodeAnswers,
  encodeAnswers,
  findLevel,
  renderMarkdownReport,
  stepsFor,
  toJsonExport,
  weakestCategories,
} from '@vantra-design/maturity-core'

usePageSeo({
  title: 'Maturity Check — Result',
  description:
    'Your design system maturity result: scores, levels, and concrete next steps across four dimensions.',
  noindex: true,
  breadcrumb: [
    { name: 'Tools', path: '/tools' },
    { name: 'Design System Maturity Check', path: MC_BASE },
    { name: 'Result', path: `${MC_BASE}/result` },
  ],
})

const route = useRoute()
const router = useRouter()

const { catalog, answers, locale, isSharedView, answered, total, result, reset } =
  useMaturityInit()
const t = useMcT()
const m = useMcMessages()

// ── Shared-link handling ──────────────────────────────────────────────────

const droppedCount = ref<string[]>([])

function readSharedPayload() {
  const encoded = route.hash.startsWith('#a=')
    ? route.hash.slice(3)
    : (route.query.a as string | undefined)
  if (!encoded) return

  const decoded = decodeAnswers(catalog, encoded)
  if (!decoded) return

  answers.value = decoded.answers
  droppedCount.value = decoded.dropped ?? []
  isSharedView.value = true
}

onMounted(readSharedPayload)

function leaveSharedView() {
  isSharedView.value = false
  router.replace({ path: route.path, query: {}, hash: '' })
}

function startMyOwnCheck() {
  leaveSharedView()
  router.push(`${MC_BASE}/check/${catalog.categories[0]!.id}`)
}

// ── Derived state ─────────────────────────────────────────────────────────

const labels = computed(() => {
  const map: Record<string, string> = {}
  for (const category of catalog.categories) {
    map[category.id] = t(category.name) || category.id
  }
  return map
})

const overallLevel = computed(() =>
  findLevel(catalog, result.value.overall.level),
)

const weak = computed(() => weakestCategories(result.value))

const nextStepsByCategory = computed(() =>
  catalog.categories.map((category) => {
    const catResult = result.value.categories.find(
      (c) => c.categoryId === category.id,
    )
    return {
      categoryId: category.id,
      label: t(category.name),
      isWeak: weak.value.includes(category.id),
      steps: stepsFor(catalog, category.id, catResult?.level ?? null),
    }
  }),
)

// ── Export ─────────────────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadMarkdown() {
  const md = renderMarkdownReport(catalog, result.value, { locale: locale.value, answers: answers.value })
  downloadFile(md, 'maturity-check-report.md', 'text/markdown')
}

function downloadJson() {
  const json = toJsonExport(result.value, answers.value, locale.value, catalog.version)
  downloadFile(JSON.stringify(json, null, 2), 'maturity-check-export.json', 'application/json')
}

const linkCopied = ref(false)
const copyFailed = ref(false)

async function copyShareLink() {
  const link = `${window.location.origin}${MC_BASE}/result#a=${encodeAnswers(catalog, answers.value)}`
  try {
    await navigator.clipboard.writeText(link)
    linkCopied.value = true
    copyFailed.value = false
    setTimeout(() => (linkCopied.value = false), 4000)
  } catch {
    copyFailed.value = true
    linkCopied.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────

const showDeleteConfirm = ref(false)
const deleted = ref(false)

function confirmDelete() {
  reset()
  showDeleteConfirm.value = false
  deleted.value = true
}
</script>

<template>
  <div>
    <section class="gutter pt-16 md:pt-24">
      <p class="caption">Tools — 19</p>

      <!-- ── Shared-view banner ────────────────────────────────────── -->
      <div
        v-if="isSharedView"
        role="status"
        class="panel mt-8 px-6 py-5"
      >
        <p class="font-display text-title font-bold">{{ m('sharedViewTitle') }}</p>
        <p class="mt-2 measure text-ink-muted">{{ m('sharedViewBody') }}</p>
        <p v-if="droppedCount.length === 1" class="mt-2 text-ink-faint">{{ m('resultDroppedOne') }}</p>
        <p v-else-if="droppedCount.length > 1" class="mt-2 text-ink-faint">
          {{ m('resultDropped', { count: droppedCount.length }) }}
        </p>
        <div class="mt-4 flex flex-wrap gap-4">
          <button type="button" class="btn btn-solid" @click="leaveSharedView">
            {{ m('sharedViewSeeMine') }}
          </button>
          <button type="button" class="btn btn-quiet" @click="startMyOwnCheck">
            {{ m('sharedViewStartOwn') }}
          </button>
        </div>
      </div>

      <!-- ── Empty state ────────────────────────────────────────── -->
      <template v-if="answered === 0 && !isSharedView">
        <h1 class="mt-8 font-display text-display max-w-[26ch] text-balance">
          {{ m('resultEmptyTitle') }}
        </h1>
        <p class="mt-6 text-lead measure text-ink-muted">
          {{ m('resultEmptyBody') }}
        </p>
        <NuxtLink
          :to="`${MC_BASE}/check/${catalog.categories[0]!.id}`"
          class="btn btn-solid mt-8"
        >
          {{ m('introStart') }}
        </NuxtLink>
      </template>

      <!-- ── Result view ─────────────────────────────────────────── -->
      <template v-else-if="answered > 0">
        <h1 class="mt-8 font-display text-display max-w-[26ch] text-balance">
          <template v-if="overallLevel">
            {{ m('resultLevelHeading', { level: overallLevel.level, name: t(overallLevel.name) }) }}
          </template>
        </h1>

        <p class="mt-4 text-ink-muted tabular-nums">
          {{ m('resultAnsweredCount', { answered, total }) }}
        </p>

        <p
          v-if="answered < total"
          class="mt-2 text-ink-faint"
        >
          {{ m('resultPartial') }}
        </p>

        <!-- ── Radar + table ───────────────────────────────────── -->
        <div class="mt-16 md:grid md:grid-cols-12 md:gap-x-8">
          <div class="md:col-span-5">
            <McScoreRadar :result="result" :labels="labels" />
          </div>
          <div class="md:col-span-7 mt-8 md:mt-0">
            <McScoreTable :result="result" :labels="labels" />
          </div>
        </div>

        <!-- ── Next steps ──────────────────────────────────────── -->
        <section class="mt-section border-t border-ink pt-8">
          <h2 class="caption">{{ m('resultNextTitle') }}</h2>
          <p class="mt-4 measure text-ink-muted">
            {{ m('resultNextLead', { marker: m('resultStartHere') }) }}
          </p>

          <div class="mt-12 grid gap-14 md:grid-cols-2">
            <div
              v-for="cat in nextStepsByCategory"
              :key="cat.categoryId"
            >
              <h3 class="font-display text-title font-bold">
                {{ cat.label }}
                <span v-if="cat.isWeak" class="ml-2 text-blue">
                  ← {{ m('resultStartHere') }}
                </span>
              </h3>
              <ol class="mt-5 space-y-4">
                <li
                  v-for="(ns, i) in cat.steps"
                  :key="ns.id"
                  class="border-l-2 border-rule pl-5"
                  :class="{ 'border-blue': i === 0 && cat.isWeak }"
                >
                  <p class="font-display font-bold">{{ t(ns.title) }}</p>
                  <p class="mt-1 measure text-ink-muted">{{ t(ns.detail) }}</p>
                  <p class="mt-1 text-caption normal-case tracking-normal text-ink-faint">
                    {{ m(ns.effort === 'S' ? 'effortS' : ns.effort === 'M' ? 'effortM' : 'effortL') }}
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <!-- ── Export & share ──────────────────────────────────── -->
        <section class="mt-section border-t border-ink pt-8">
          <h2 class="caption">{{ m('resultExportTitle') }}</h2>
          <p class="mt-4 measure text-ink-muted">{{ m('resultExportLead') }}</p>

          <div class="mt-8 flex flex-wrap gap-4">
            <button type="button" class="btn btn-quiet" @click="downloadMarkdown">
              {{ m('resultDownloadMarkdown') }}
            </button>
            <button type="button" class="btn btn-quiet" @click="downloadJson">
              {{ m('resultDownloadJson') }}
            </button>
            <button type="button" class="btn btn-solid" @click="copyShareLink">
              {{ linkCopied ? m('resultLinkCopied') : m('resultCopyLink') }}
            </button>
          </div>
          <p v-if="linkCopied" class="mt-3 text-ink-muted">{{ m('resultShareNote') }}</p>
          <p v-if="copyFailed" class="mt-3 text-ink-muted">{{ m('resultCopyFailed') }}</p>
        </section>

        <!-- ── Caveat ──────────────────────────────────────────── -->
        <section class="mt-section border-t border-rule pt-8">
          <h2 class="caption">{{ m('resultCaveatTitle') }}</h2>
          <p class="mt-4 measure text-ink-muted">{{ m('resultCaveatBody') }}</p>
        </section>

        <!-- ── Delete ──────────────────────────────────────────── -->
        <section v-if="!isSharedView" class="mt-section border-t border-rule pt-8 pb-16">
          <button
            v-if="!showDeleteConfirm && !deleted"
            type="button"
            class="text-caption normal-case tracking-normal text-ink-muted underline decoration-rule hover:text-ink"
            @click="showDeleteConfirm = true"
          >
            {{ m('resultDelete') }}
          </button>

          <div v-if="showDeleteConfirm" class="panel max-w-lg px-6 py-5">
            <p class="font-display font-bold">{{ m('resultDeleteConfirmQuestion') }}</p>
            <p class="mt-2 text-ink-muted">{{ m('resultDeleteExportFirst') }}</p>
            <div class="mt-4 flex flex-wrap gap-4">
              <button type="button" class="btn btn-quiet" @click="showDeleteConfirm = false">
                {{ m('resultDeleteCancel') }}
              </button>
              <button type="button" class="btn btn-solid" @click="confirmDelete">
                {{ m('resultDeleteConfirmYes') }}
              </button>
            </div>
          </div>

          <p v-if="deleted" role="status" class="text-ink-muted">
            {{ m('resultDeleted') }}
          </p>
        </section>
      </template>
    </section>

    <ToolFooterNav slug="maturity-check" />
  </div>
</template>
