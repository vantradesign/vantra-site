import {
  designSystemCatalog,
  scoreAssessment,
  resolveLocale,
  t as coreTranslate,
  type AnswerSet,
  type Locale,
} from '@vantra-design/maturity-core'
import { messages, type MessageKey } from '~/i18n/maturity-messages'

/** Base path for all maturity-check routes inside the main site. */
export const MC_BASE = '/tools/maturity-check'

const STORAGE_KEY = 'vantra-maturity-check'

interface StoredState {
  catalogVersion: string
  answers: AnswerSet
  locale: Locale
}

/**
 * Sanitise answers restored from localStorage: only keep entries whose question
 * and option still exist in the current catalog.
 */
function sanitiseAnswers(catalog: typeof designSystemCatalog, raw: AnswerSet): AnswerSet {
  const clean: AnswerSet = {}
  for (const [questionId, answer] of Object.entries(raw)) {
    const question = catalog.categories
      .flatMap((c) => c.questions)
      .find((q) => q.id === questionId)
    if (!question) continue
    if (!question.options.some((o) => o.id === answer.optionId)) continue
    clean[questionId] = answer
  }
  return clean
}

// ─── Shared reactive state (survives page navigations) ──────────────

export function useMcCatalog() {
  return designSystemCatalog
}

export function useMcAnswers() {
  return useState<AnswerSet>('mc-answers', () => ({}))
}

export function useMcLocale() {
  return useState<Locale>('mc-locale', () => 'en')
}

export function useMcIsSharedView() {
  return useState('mc-shared-view', () => false)
}

// ─── Derived helpers ────────────────────────────────────────────────

export function useMcT() {
  const locale = useMcLocale()
  return (text: { en: string; de: string } | undefined) =>
    text ? coreTranslate(text, locale.value) : ''
}

export function useMcMessages() {
  const locale = useMcLocale()
  return (key: MessageKey, vars?: Record<string, string | number>) => {
    let text = messages[locale.value][key] ?? messages.en[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replaceAll(`{${k}}`, String(v))
      }
    }
    return text
  }
}

/** Step metadata derived from the catalog. */
export function useMcSteps() {
  const catalog = useMcCatalog()
  return catalog.categories.map((category, index) => ({
    id: category.id,
    index,
    number: index + 1,
    of: catalog.categories.length,
    previous: index > 0 ? catalog.categories[index - 1].id : null,
    next: index < catalog.categories.length - 1 ? catalog.categories[index + 1].id : null,
  }))
}

// ─── Main composable ────────────────────────────────────────────────

export function useMaturityAssessment() {
  const catalog = useMcCatalog()
  const answers = useMcAnswers()
  const locale = useMcLocale()
  const isSharedView = useMcIsSharedView()

  const total = computed(() =>
    catalog.categories.reduce((sum, c) => sum + c.questions.length, 0),
  )
  const answered = computed(() => Object.keys(answers.value).length)
  const progress = computed(() =>
    total.value === 0 ? 0 : answered.value / total.value,
  )
  const isComplete = computed(() => answered.value === total.value)

  const result = computed(() =>
    scoreAssessment(catalog, answers.value, {
      completedAt: new Date().toISOString(),
    }),
  )

  function answeredIn(categoryId: string) {
    const category = catalog.categories.find((c) => c.id === categoryId)
    if (!category) return 0
    return category.questions.filter((q) => q.id in answers.value).length
  }

  function select(questionId: string, optionId: string) {
    answers.value = {
      ...answers.value,
      [questionId]: { ...answers.value[questionId], questionId, optionId },
    }
  }

  function setNote(questionId: string, note: string) {
    const existing = answers.value[questionId]
    if (!existing) return
    const trimmed = note.trim()
    answers.value = {
      ...answers.value,
      [questionId]:
        trimmed === ''
          ? { ...existing, note: undefined }
          : { ...existing, note },
    }
  }

  function reset() {
    answers.value = {}
    isSharedView.value = false
    if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
  }

  function restore(): void {
    if (!import.meta.client) return

    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const stored = JSON.parse(raw) as StoredState
        const storedMajor = stored.catalogVersion?.split('.')[0]
        const currentMajor = catalog.version.split('.')[0]
        if (storedMajor === currentMajor) {
          answers.value = sanitiseAnswers(catalog, stored.answers ?? {})
          if (stored.locale) locale.value = stored.locale
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    } else {
      locale.value = resolveLocale(navigator.language)
    }
  }

  function persist(): void {
    if (!import.meta.client) return
    if (isSharedView.value) return

    const state: StoredState = {
      catalogVersion: catalog.version,
      answers: answers.value,
      locale: locale.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  return {
    catalog,
    answers,
    locale,
    isSharedView,
    total,
    answered,
    progress,
    isComplete,
    result,
    answeredIn,
    select,
    setNote,
    reset,
    restore,
    persist,
  }
}

/**
 * One-call setup for any maturity-check page: restores state from
 * localStorage, persists on change, and sets the HTML lang attribute.
 */
export function useMaturityInit() {
  const assessment = useMaturityAssessment()
  const { answers, locale, restore, persist } = assessment

  onMounted(restore)
  watch([answers, locale], persist, { deep: true })
  useHead(() => ({ htmlAttrs: { lang: locale.value } }))

  return assessment
}
