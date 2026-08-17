import type { TokenSchema, ColorPrimitive, ZIndexToken, BreakpointToken, FocusRingConfig, ColorRamp, DarkModeMapping } from '~/utils/tools/token-schema'
import { createDefaultSchema, TOKEN_SCHEMA_KEY } from '~/utils/tools/token-schema'

/**
 * Reactive token schema that persists to localStorage.
 *
 * Every tool reads from and writes to this single composable. The schema lives
 * in a module-scoped ref so all components on the same page share one instance
 * — no prop drilling, no provide/inject ceremony.
 *
 * On SSR the schema is the default (Vantra's own palette). On the client it
 * hydrates from localStorage if present.
 */

const schema = ref<TokenSchema>(createDefaultSchema())
let hydrated = false

function hydrateOnce() {
  if (hydrated || import.meta.server) return
  hydrated = true

  try {
    const raw = localStorage.getItem(TOKEN_SCHEMA_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as TokenSchema
      if (parsed.$version === 1) {
        schema.value = parsed
      }
    }
  } catch {
    // Corrupt or missing — keep the default.
  }
}

function persist() {
  if (import.meta.server) return
  try {
    localStorage.setItem(TOKEN_SCHEMA_KEY, JSON.stringify(schema.value))
  } catch {
    // Storage full or unavailable — silent.
  }
}

export function useTokenSchema() {
  hydrateOnce()

  // ── Color primitives ───────────────────────────────────────────────────

  function setColorPrimitive(key: string, token: ColorPrimitive) {
    schema.value.color.primitives[key] = token
    persist()
  }

  function removeColorPrimitive(key: string) {
    delete schema.value.color.primitives[key]
    persist()
  }

  function getColorPrimitives(): Record<string, ColorPrimitive> {
    return schema.value.color.primitives
  }

  // ── Color ramps ────────────────────────────────────────────────────────

  function saveRamp(ramp: ColorRamp) {
    // Overwrite if same name exists
    const existing = schema.value.color.ramps.findIndex((r) => r.name === ramp.name)
    if (existing >= 0) {
      schema.value.color.ramps[existing] = ramp
    } else {
      schema.value.color.ramps.push(ramp)
    }

    // Also write each step as a primitive
    for (const [step, token] of Object.entries(ramp.steps)) {
      schema.value.color.primitives[`${ramp.name}-${step}`] = token
    }

    persist()
  }

  // ── Semantic tokens ────────────────────────────────────────────────────

  function setSemanticToken(key: string, primitiveKey: string) {
    schema.value.color.semantic[key] = primitiveKey
    persist()
  }

  function getSemanticTokens(): Record<string, string> {
    return schema.value.color.semantic
  }

  /**
   * Resolve a semantic token to its primitive hex value.
   * Returns undefined if the chain is broken.
   */
  function resolveSemanticColor(semanticKey: string): string | undefined {
    const primitiveKey = schema.value.color.semantic[semanticKey]
    if (!primitiveKey) return undefined
    return schema.value.color.primitives[primitiveKey]?.$value
  }

  // ── Z-index tokens ────────────────────────────────────────────────────

  function setZIndexTokens(tokens: Record<string, ZIndexToken>) {
    schema.value.zIndex = tokens
    persist()
  }

  function getZIndexTokens(): Record<string, ZIndexToken> {
    return schema.value.zIndex
  }

  // ── Breakpoint tokens ──────────────────────────────────────────────────

  function setBreakpointTokens(tokens: Record<string, BreakpointToken>) {
    schema.value.breakpoints = tokens
    persist()
  }

  function getBreakpointTokens(): Record<string, BreakpointToken> {
    return schema.value.breakpoints
  }

  // ── Focus ring ─────────────────────────────────────────────────────────

  function setFocusRing(config: FocusRingConfig) {
    schema.value.focusRing = config
    persist()
  }

  function getFocusRing(): FocusRingConfig | null {
    return schema.value.focusRing
  }

  // ── Dark mode ──────────────────────────────────────────────────────────

  function setDarkModeMapping(mapping: DarkModeMapping) {
    schema.value.darkMode = mapping
    persist()
  }

  function getDarkModeMapping(): DarkModeMapping {
    return schema.value.darkMode
  }

  // ── Schema-level operations ────────────────────────────────────────────

  function resetSchema() {
    schema.value = createDefaultSchema()
    persist()
  }

  function exportSchema(): TokenSchema {
    return JSON.parse(JSON.stringify(schema.value)) as TokenSchema
  }

  function importSchema(incoming: TokenSchema) {
    if (incoming.$version === 1) {
      schema.value = incoming
      persist()
    }
  }

  return {
    schema: readonly(schema),
    setColorPrimitive,
    removeColorPrimitive,
    getColorPrimitives,
    saveRamp,
    setSemanticToken,
    getSemanticTokens,
    resolveSemanticColor,
    setZIndexTokens,
    getZIndexTokens,
    setBreakpointTokens,
    getBreakpointTokens,
    setFocusRing,
    getFocusRing,
    setDarkModeMapping,
    getDarkModeMapping,
    resetSchema,
    exportSchema,
    importSchema,
  }
}
