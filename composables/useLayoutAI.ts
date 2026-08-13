import type { BuilderState } from '~/utils/tools/layout'
import type { LayoutAIProvider, AILayoutResult, OllamaConfig } from '~/utils/tools/layout-ai'
import {
  OLLAMA_DEFAULTS,
  createOllamaProvider,
  mergeAILayout,
  parseAILayoutResponse,
  resolveProvider,
} from '~/utils/tools/layout-ai'

const SETTINGS_KEY = 'vantra:layout-ai'

/** One submission per this window, on top of the in-flight guard. */
const MIN_INTERVAL_MS = 1200

export type LayoutAIStatus = 'unknown' | 'checking' | 'ready' | 'unavailable'

function readSettings(): OllamaConfig {
  if (!import.meta.client) return { ...OLLAMA_DEFAULTS }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...OLLAMA_DEFAULTS }

    const parsed = JSON.parse(raw) as Partial<OllamaConfig>
    return {
      baseUrl: typeof parsed.baseUrl === 'string' && parsed.baseUrl ? parsed.baseUrl : OLLAMA_DEFAULTS.baseUrl,
      model: typeof parsed.model === 'string' && parsed.model ? parsed.model : OLLAMA_DEFAULTS.model,
    }
  } catch {
    /* A corrupt or blocked localStorage must not stop the tool from loading. */
    return { ...OLLAMA_DEFAULTS }
  }
}

/**
 * The prompt-to-layout flow.
 *
 * Deliberately thin: reachability, one request, parse, and hold the result until
 * the user accepts it. All of the actual logic (schema, prompt, transport, merge)
 * is pure and lives in `utils/tools/layout-ai.ts`, so it is unit-tested without
 * mounting anything.
 *
 * Providers are resolved from a list. Today that list holds one local Ollama;
 * adding a hosted provider means pushing a second object into it and nothing in
 * this file or in any component changes.
 */
export function useLayoutAI() {
  const config = reactive<OllamaConfig>(readSettings())

  const status = ref<LayoutAIStatus>('unknown')
  const pending = ref(false)
  const error = ref<string | null>(null)
  const suggestion = ref<AILayoutResult | null>(null)
  const preview = ref<BuilderState | null>(null)
  const provider = ref<LayoutAIProvider | null>(null)

  let lastSubmitted = 0
  let controller: AbortController | null = null

  const providers = computed<LayoutAIProvider[]>(() => [
    createOllamaProvider({ baseUrl: config.baseUrl, model: config.model }),
  ])

  /** The hint shown in the unavailable state, taken from the provider itself. */
  const hint = computed(() => providers.value[0]?.hint ?? '')

  watch(
    config,
    (next) => {
      if (!import.meta.client) return
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...next }))
      } catch {
        /* Private-mode Safari throws on write. The tool still works this session. */
      }
      /* Pointing at a different host invalidates the last probe. */
      status.value = 'unknown'
    },
    { deep: true },
  )

  async function checkAvailability(): Promise<boolean> {
    status.value = 'checking'
    error.value = null

    const probe = new AbortController()
    const timeout = setTimeout(() => probe.abort(), 2500)

    try {
      const found = await resolveProvider(providers.value, probe.signal)
      provider.value = found
      status.value = found ? 'ready' : 'unavailable'
      return Boolean(found)
    } finally {
      clearTimeout(timeout)
    }
  }

  const canSubmit = computed(() => !pending.value)

  async function generate(prompt: string, state: BuilderState): Promise<void> {
    const trimmed = prompt.trim()
    if (!trimmed) {
      error.value = 'Describe the layout first.'
      return
    }

    if (pending.value) return

    const now = Date.now()
    if (now - lastSubmitted < MIN_INTERVAL_MS) return
    lastSubmitted = now

    pending.value = true
    error.value = null
    suggestion.value = null
    preview.value = null

    controller?.abort()
    controller = new AbortController()

    try {
      const active = provider.value ?? (await resolveProvider(providers.value, controller.signal))

      if (!active) {
        provider.value = null
        status.value = 'unavailable'
        error.value = 'No local model is reachable, so nothing was sent anywhere.'
        return
      }

      provider.value = active
      status.value = 'ready'

      const raw = await active.complete({ prompt: trimmed, state, signal: controller.signal })
      const parsed = parseAILayoutResponse(raw)

      if (!parsed.ok) {
        error.value = `${parsed.error} Try rephrasing, or build it by hand.`
        return
      }

      suggestion.value = parsed.value
      /* The merge is computed now but applied only on Accept, so the preview and
         the accepted result can never disagree. */
      preview.value = mergeAILayout(state, parsed.value)
    } catch (thrown) {
      if (thrown instanceof DOMException && thrown.name === 'AbortError') return
      error.value =
        thrown instanceof Error
          ? `The model could not be reached: ${thrown.message}`
          : 'The model could not be reached.'
      status.value = 'unavailable'
    } finally {
      pending.value = false
    }
  }

  /** Returns the state to apply, and clears the suggestion. Never applies it itself. */
  function accept(): BuilderState | null {
    const next = preview.value
    suggestion.value = null
    preview.value = null
    return next
  }

  function discard() {
    controller?.abort()
    suggestion.value = null
    preview.value = null
    error.value = null
  }

  return {
    config,
    status,
    pending,
    canSubmit,
    error,
    suggestion,
    preview,
    provider,
    hint,
    checkAvailability,
    generate,
    accept,
    discard,
  }
}

export type LayoutAIStore = ReturnType<typeof useLayoutAI>
