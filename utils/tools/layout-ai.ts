/**
 * Natural language in, builder state out.
 *
 * Three rules hold this together:
 *
 * 1. The model returns **structured JSON**, never CSS. Its answer is applied to
 *    the same state a mouse would produce, so it stays editable and the builder
 *    remains the single source of truth.
 * 2. Nothing is trusted. Every response goes through zod, and a failure is a
 *    message in the UI rather than a broken builder.
 * 3. The provider is an interface with an injected `fetch`. Today the only
 *    implementation talks to a local Ollama; a hosted one is a new object in
 *    `LAYOUT_AI_PROVIDERS`, not a change to the UI or the resolver.
 *
 * On why local-only: /tools claims nothing leaves the browser. An Ollama running
 * on the visitor's own machine keeps that claim true. A hosted key would not,
 * which is a positioning decision and not a technical one — see the note in
 * public/_headers.
 */

import { z } from 'zod'
import type { BuilderState, LayoutItemState } from './layout'
import { parseTrackList, safeName, uniqueName } from './layout'
import { createItem } from './layout-presets'

/* ── Schema ──────────────────────────────────────────────────────────────── */

const trackValue = z.string().trim().min(1).max(200)

export const aiLayoutItemSchema = z.object({
  name: z.string().trim().min(1).max(40),
  area: trackValue.optional(),
  column: trackValue.optional(),
  row: trackValue.optional(),
  flexGrow: z.number().min(0).max(999).optional(),
  flexBasis: trackValue.optional(),
})

export const aiLayoutResultSchema = z.object({
  mode: z.enum(['grid', 'flex']),
  columns: trackValue.optional(),
  rows: trackValue.optional(),
  areas: z.array(z.string().trim().min(1)).max(24).optional(),
  gap: trackValue.optional(),
  items: z.array(aiLayoutItemSchema).min(1).max(24),
  explanation: z.string().trim().min(1).max(600),
})

export type AILayoutItem = z.infer<typeof aiLayoutItemSchema>
export type AILayoutResult = z.infer<typeof aiLayoutResultSchema>

/* ── Defensive parsing ───────────────────────────────────────────────────── */

/**
 * Small models add prose and markdown fences however firmly you ask them not to,
 * so the object is cut out of the response rather than assumed to be all of it.
 * Scans for the outermost balanced braces, ignoring braces inside strings.
 */
export function extractJsonObject(raw: string): string | null {
  const text = raw.replace(/```(?:json)?/gi, '')
  const start = text.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < text.length; i += 1) {
    const char = text[i]!

    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }

    if (char === '"') inString = true
    else if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return text.slice(start, i + 1)
    }
  }

  return null
}

export type ParseOutcome =
  | { ok: true; value: AILayoutResult }
  | { ok: false; error: string }

export function parseAILayoutResponse(raw: string): ParseOutcome {
  const json = extractJsonObject(raw)
  if (!json) {
    return { ok: false, error: 'The model replied without any JSON object in it.' }
  }

  let candidate: unknown
  try {
    candidate = JSON.parse(json)
  } catch {
    return { ok: false, error: 'The model returned JSON that could not be parsed.' }
  }

  const result = aiLayoutResultSchema.safeParse(candidate)
  if (!result.success) {
    const first = result.error.issues[0]
    const path = first?.path.join('.') ?? 'response'
    return {
      ok: false,
      error: `The layout did not match the expected shape (${path}: ${first?.message ?? 'invalid'}).`,
    }
  }

  return { ok: true, value: result.data }
}

/* ── Named areas ─────────────────────────────────────────────────────────── */

/**
 * `grid-template-areas` is all-or-nothing: one ragged row or one L-shaped region
 * and the browser drops the whole declaration silently. Cheaper to say so here
 * than to let a user wonder why their copied CSS does nothing.
 */
export function areaIssues(areas: string[]): string[] {
  const rows = areas.map((row) => row.trim().split(/\s+/)).filter((row) => row.length > 0)
  if (rows.length === 0) return []

  const issues: string[] = []
  const width = rows[0]!.length

  if (rows.some((row) => row.length !== width)) {
    issues.push('Every row of the area map needs the same number of cells.')
    return issues
  }

  const names = new Set(rows.flat().filter((name) => name !== '.'))

  for (const name of names) {
    let minRow = Infinity
    let maxRow = -Infinity
    let minCol = Infinity
    let maxCol = -Infinity

    rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== name) return
        minRow = Math.min(minRow, rowIndex)
        maxRow = Math.max(maxRow, rowIndex)
        minCol = Math.min(minCol, colIndex)
        maxCol = Math.max(maxCol, colIndex)
      })
    })

    for (let r = minRow; r <= maxRow; r += 1) {
      for (let c = minCol; c <= maxCol; c += 1) {
        if (rows[r]![c] !== name) {
          issues.push(`Area "${name}" is not a rectangle, so the whole map is invalid.`)
          return issues
        }
      }
    }
  }

  return issues
}

/* ── Applying a suggestion ───────────────────────────────────────────────── */

/**
 * Folds a validated suggestion into the builder.
 *
 * Existing items are matched by name and reused, so anything the user set by
 * hand — an align-self, a subgrid — survives a prompt that did not mention it.
 * Pure: the input state is never mutated, which is what lets "Discard" be free.
 */
export function mergeAILayout(state: BuilderState, result: AILayoutResult): BuilderState {
  const usedNames: string[] = []

  const items: LayoutItemState[] = result.items.map((incoming) => {
    const name = uniqueName(safeName(incoming.name), usedNames)
    usedNames.push(name)

    const existing = state.items.find((item) => item.name === name)
    const base = existing ? { ...existing, subgrid: { ...existing.subgrid } } : createItem(name)

    return {
      ...base,
      name,
      /* `area` is the container's business; on the child it only means "place me
         by name", which the area map already encodes. */
      column: incoming.column ?? base.column,
      row: incoming.row ?? base.row,
      flexGrow: incoming.flexGrow ?? base.flexGrow,
      flexBasis: incoming.flexBasis ?? base.flexBasis,
    }
  })

  const areas = result.areas ?? []
  const useAreas = areas.length > 0 && areaIssues(areas).length === 0

  return {
    ...state,
    mode: result.mode,
    grid: {
      ...state.grid,
      columns: result.columns ? parseTrackList(result.columns) : state.grid.columns,
      rows: result.rows ? parseTrackList(result.rows) : state.grid.rows,
      areas: useAreas ? areas.map((row) => row.trim()) : state.grid.areas,
      useAreas,
      rowGap: result.gap ?? state.grid.rowGap,
      columnGap: result.gap ?? state.grid.columnGap,
      gapLinked: result.gap ? true : state.grid.gapLinked,
    },
    flex: {
      ...state.flex,
      rowGap: result.gap ?? state.flex.rowGap,
      columnGap: result.gap ?? state.flex.columnGap,
      gapLinked: result.gap ? true : state.flex.gapLinked,
    },
    items,
    selectedId: null,
  }
}

/* ── Providers ───────────────────────────────────────────────────────────── */

export const LAYOUT_SYSTEM_PROMPT = `You convert a description of a web layout into JSON for a CSS layout builder.

Respond with a single JSON object and nothing else. No prose, no markdown code fences.

Schema:
{
  "mode": "grid" | "flex",
  "columns": string,            // a grid-template-columns value, grid mode only
  "rows": string,               // a grid-template-rows value, grid mode only
  "areas": string[],            // one string per row, cell names separated by single spaces, "." for an empty cell
  "gap": string,                // a single CSS length, e.g. "16px"
  "items": [
    {
      "name": string,           // lowercase, hyphens only, matches a name used in "areas"
      "column": string,         // a grid-column value, only when "areas" is not used
      "row": string,            // a grid-row value, only when "areas" is not used
      "flexGrow": number,       // flex mode only
      "flexBasis": string       // flex mode only
    }
  ],
  "explanation": string         // one or two sentences on why the layout is shaped this way
}

Rules:
- Choose "grid" for two-dimensional layouts (rows and columns both matter) and "flex" for a single row or column of items.
- For three or more distinct regions in grid mode, always use "areas": named areas read better than line numbers.
- Every row in "areas" must contain the same number of cells, and each name must form a rectangle. A sidebar spanning two rows repeats its name on both rows.
- Every name used in "areas" must appear exactly once in "items".
- In flex mode omit "columns", "rows" and "areas" entirely.
- Use "fr" for space that should be shared, "auto" for content-sized tracks, and minmax() where a track has a floor.`

export interface LayoutAIRequest {
  prompt: string
  state: BuilderState
  signal?: AbortSignal
}

export interface LayoutAIProvider {
  id: string
  label: string
  /** Short line shown when the provider cannot be reached. */
  hint: string
  isAvailable(signal?: AbortSignal): Promise<boolean>
  /** Returns the model's raw text. Parsing is the caller's job, on purpose. */
  complete(request: LayoutAIRequest): Promise<string>
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export interface OllamaConfig {
  baseUrl: string
  model: string
}

export const OLLAMA_DEFAULTS: OllamaConfig = {
  baseUrl: 'http://localhost:11434',
  model: 'llama3.1:8b',
}

function userMessage(request: LayoutAIRequest): string {
  const { state } = request
  const context =
    state.mode === 'grid'
      ? `The builder is currently in grid mode with ${state.grid.columns.length} columns and ${state.items.length} items.`
      : `The builder is currently in flex mode with ${state.items.length} items.`

  return `${context}\n\nLayout to build: ${request.prompt}`
}

/**
 * Ollama's /api/chat with `format: 'json'` and `stream: false`. The format flag
 * constrains the sampler to valid JSON, which is why an 8B model is enough here;
 * the response is still parsed defensively because the *shape* is not constrained.
 */
export function createOllamaProvider(
  config: OllamaConfig = OLLAMA_DEFAULTS,
  fetchImpl: FetchLike = globalThis.fetch,
): LayoutAIProvider {
  const base = config.baseUrl.replace(/\/+$/, '')

  return {
    id: 'ollama',
    label: 'Local — Ollama',
    hint: `Start Ollama and run \`ollama pull ${config.model}\`. It has to allow this origin: \`OLLAMA_ORIGINS=https://vantra.design ollama serve\`.`,

    async isAvailable(signal) {
      try {
        const response = await fetchImpl(`${base}/api/tags`, { method: 'GET', signal })
        return response.ok
      } catch {
        return false
      }
    },

    async complete(request) {
      const response = await fetchImpl(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          stream: false,
          format: 'json',
          options: { temperature: 0.2 },
          messages: [
            { role: 'system', content: LAYOUT_SYSTEM_PROMPT },
            { role: 'user', content: userMessage(request) },
          ],
        }),
        signal: request.signal,
      })

      if (!response.ok) {
        throw new Error(`Ollama answered ${response.status}.`)
      }

      const payload = (await response.json()) as { message?: { content?: string } }
      const content = payload.message?.content
      if (!content) throw new Error('Ollama returned an empty message.')

      return content
    },
  }
}

/**
 * Picks the first reachable provider. With one provider this is a reachability
 * check; the list exists so that adding a hosted provider later is a change to
 * an array rather than to any calling code.
 */
export async function resolveProvider(
  providers: readonly LayoutAIProvider[],
  signal?: AbortSignal,
): Promise<LayoutAIProvider | null> {
  for (const provider of providers) {
    if (await provider.isAvailable(signal)) return provider
  }
  return null
}
