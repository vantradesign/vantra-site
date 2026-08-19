<script setup lang="ts">
import {
  findLevel,
  stepsFor,
  encodeAnswers,
  renderMarkdownReport,
  toJsonExport,
  weakestCategories,
} from '@vantra-design/maturity-core'

definePageMeta({ layout: 'fullscreen' })

useToolPageSeo({
  slug: 'maturity-check',
  title: 'Design System Maturity Check',
  description:
    'A 24-question self-assessment across documentation, versioning, governance and adoption. Scores four dimensions and returns next steps for the level you reached. Runs entirely in the browser.',
})

// ── State ──

const { catalog, answers, locale, answered, total, answeredIn, result, reset } =
  useMaturityInit()
const t = useMcT()
const m = useMcMessages()

// ── Scroll spy ──

const activeCategory = ref(catalog.categories[0]?.id ?? '')
const scrollContainer = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const container = scrollContainer.value
  if (!container) return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeCategory.value = entry.target.id.replace('category-', '')
        }
      }
    },
    { root: container, rootMargin: '-10% 0px -70% 0px' },
  )

  for (const category of catalog.categories) {
    const el = document.getElementById(`category-${category.id}`)
    if (el) observer.observe(el)
  }
})

onUnmounted(() => observer?.disconnect())

function scrollToCategory(id: string) {
  document.getElementById(`category-${id}`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

// ── Result derived state ──

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

// ── Export ──

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
  const md = renderMarkdownReport(catalog, result.value, {
    locale: locale.value,
    answers: answers.value,
  })
  downloadFile(md, 'maturity-check-report.md', 'text/markdown')
}

function downloadJson() {
  const json = toJsonExport(
    result.value,
    answers.value,
    locale.value,
    catalog.version,
  )
  downloadFile(
    JSON.stringify(json, null, 2),
    'maturity-check-export.json',
    'application/json',
  )
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

// ── Reset ──

const showDeleteConfirm = ref(false)
const deleted = ref(false)

function confirmDelete() {
  reset()
  showDeleteConfirm.value = false
  deleted.value = true
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
        <span class="hidden font-display text-[1rem] font-700 tracking-tight sm:inline">Maturity Check</span>
      </div>
      <div class="flex items-center gap-4">
        <span
          v-if="answered > 0"
          class="text-[0.8125rem] tabular-nums text-ink-muted"
        >
          {{ answered }}/{{ total }}
        </span>
        <McLocaleToggle />
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
      </div>
    </header>

    <!-- Main content -->
    <div ref="scrollContainer" class="flex-1 overflow-y-auto">
      <!-- Progress rail -->
      <nav
        :aria-label="m('progressLabel')"
        class="sticky top-0 z-30 flex h-12 border-b border-rule bg-paper"
      >
        <button
          v-for="(category, index) in catalog.categories"
          :key="category.id"
          type="button"
          class="group relative flex flex-1 items-center justify-center overflow-hidden border-r border-rule transition-colors duration-200 ease-editorial last:border-r-0"
          :class="activeCategory === category.id ? 'bg-white' : 'hover:bg-white/50'"
          :aria-current="activeCategory === category.id ? 'step' : undefined"
          @click="scrollToCategory(category.id)"
        >
          <span class="relative z-10 text-caption normal-case tracking-normal">
            <span class="hidden sm:inline">{{ t(category.name) }}</span>
            <span class="sm:hidden">{{ index + 1 }}</span>
          </span>
          <span
            class="absolute inset-y-0 left-0 bg-blue/10 transition-[width] duration-300 ease-editorial"
            :style="{
              width: `${(answeredIn(category.id) / category.questions.length) * 100}%`,
            }"
          />
        </button>
      </nav>

      <div class="mx-auto max-w-[1440px] p-[clamp(1.25rem,4vw,3rem)]">
        <!-- Header -->
        <div class="mb-12">
          <h1 class="font-display text-display">Design System Maturity Check</h1>
          <p class="mt-2 max-w-[60ch] text-ink-muted">
            {{ t(catalog.description) }}
          </p>
        </div>

        <!-- Categories -->
        <section
          v-for="(category, ci) in catalog.categories"
          :key="category.id"
          :id="`category-${category.id}`"
          class="scroll-mt-12 mb-20"
        >
          <header class="mb-8 max-w-3xl">
            <p class="caption">
              {{ m('stepOf', { number: ci + 1, total: catalog.categories.length }) }}
            </p>
            <h2 class="mt-2 font-display text-display max-w-[20ch] text-balance">
              {{ t(category.name) }}
            </h2>
            <p class="mt-3 measure text-ink-muted">{{ t(category.description) }}</p>
            <p class="mt-2 text-ink-faint">{{ m('stepSkipNote') }}</p>
          </header>

          <div class="max-w-3xl space-y-2">
            <McQuestionBlock
              v-for="(question, qi) in category.questions"
              :key="question.id"
              :question="question"
              :index="qi + 1"
            />
          </div>
        </section>

        <!-- Result -->
        <section id="result" class="scroll-mt-12 border-t-2 border-ink pt-12 pb-16">
          <template v-if="answered === 0">
            <h2 class="font-display text-display max-w-[26ch] text-balance">
              {{ m('resultEmptyTitle') }}
            </h2>
            <p class="mt-4 text-lead measure text-ink-muted">
              {{ m('resultEmptyBody') }}
            </p>
          </template>

          <template v-else>
            <h2 class="font-display text-display max-w-[26ch] text-balance">
              <template v-if="overallLevel">
                {{ m('resultLevelHeading', { level: overallLevel.level, name: t(overallLevel.name) }) }}
              </template>
            </h2>

            <p class="mt-4 text-ink-muted tabular-nums">
              {{ m('resultAnsweredCount', { answered, total }) }}
            </p>
            <p v-if="answered < total" class="mt-2 text-ink-faint">
              {{ m('resultPartial') }}
            </p>

            <!-- Radar + table -->
            <div class="mt-12 md:grid md:grid-cols-12 md:gap-x-8">
              <div class="md:col-span-5">
                <McScoreRadar :result="result" :labels="labels" />
              </div>
              <div class="md:col-span-7 mt-8 md:mt-0">
                <McScoreTable :result="result" :labels="labels" />
              </div>
            </div>

            <!-- Next steps -->
            <section class="mt-section border-t border-ink pt-8">
              <h3 class="caption">{{ m('resultNextTitle') }}</h3>
              <p class="mt-4 measure text-ink-muted">
                {{ m('resultNextLead', { marker: m('resultStartHere') }) }}
              </p>

              <div class="mt-12 grid gap-14 md:grid-cols-2">
                <div
                  v-for="cat in nextStepsByCategory"
                  :key="cat.categoryId"
                >
                  <h4 class="font-display text-title font-bold">
                    {{ cat.label }}
                    <span v-if="cat.isWeak" class="ml-2 text-blue">
                      &larr; {{ m('resultStartHere') }}
                    </span>
                  </h4>
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

            <!-- Export & share -->
            <section class="mt-section border-t border-ink pt-8">
              <h3 class="caption">{{ m('resultExportTitle') }}</h3>
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

            <!-- Caveat -->
            <section class="mt-section border-t border-rule pt-8">
              <h3 class="caption">{{ m('resultCaveatTitle') }}</h3>
              <p class="mt-4 measure text-ink-muted">{{ m('resultCaveatBody') }}</p>
            </section>

            <!-- Delete -->
            <section class="mt-section border-t border-rule pt-8 pb-8">
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
      </div>
    </div>
  </div>
</template>
