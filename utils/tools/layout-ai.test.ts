import { describe, expect, it, vi } from 'vitest'
import type { BuilderState } from './layout'
import {
  LAYOUT_SYSTEM_PROMPT,
  areaIssues,
  createOllamaProvider,
  extractJsonObject,
  mergeAILayout,
  parseAILayoutResponse,
  resolveProvider,
} from './layout-ai'
import type { AILayoutResult, LayoutAIProvider } from './layout-ai'
import { createItem, defaultFlex, defaultGrid } from './layout-presets'

function state(overrides: Partial<BuilderState> = {}): BuilderState {
  return {
    mode: 'grid',
    grid: defaultGrid(),
    flex: defaultFlex(),
    items: [],
    selectedId: null,
    ...overrides,
  }
}

const VALID: AILayoutResult = {
  mode: 'grid',
  columns: '200px 1fr',
  rows: 'auto 1fr',
  areas: ['header header', 'side main'],
  gap: '16px',
  items: [{ name: 'header' }, { name: 'side' }, { name: 'main' }],
  explanation: 'A sidebar beside the content, with a header across both columns.',
}

function response(body: unknown): string {
  return JSON.stringify(body)
}

/* ── extractJsonObject ───────────────────────────────────────────────────── */

describe('extractJsonObject', () => {
  it('returns a bare object unchanged', () => {
    expect(extractJsonObject('{"a":1}')).toBe('{"a":1}')
  })

  it('cuts the object out of a markdown fence', () => {
    expect(extractJsonObject('```json\n{"a":1}\n```')).toBe('{"a":1}')
  })

  it('ignores prose on both sides, which small models add anyway', () => {
    expect(extractJsonObject('Sure! Here you go:\n{"a":1}\nHope that helps.')).toBe('{"a":1}')
  })

  it('keeps nested objects whole', () => {
    expect(extractJsonObject('noise {"a":{"b":2}} noise')).toBe('{"a":{"b":2}}')
  })

  it('is not fooled by a brace inside a string', () => {
    expect(extractJsonObject('{"a":"}"}')).toBe('{"a":"}"}')
  })

  it('is not fooled by an escaped quote before a brace', () => {
    expect(extractJsonObject('{"a":"\\"}"}')).toBe('{"a":"\\"}"}')
  })

  it('returns null when there is no object at all', () => {
    expect(extractJsonObject('I cannot help with that.')).toBeNull()
  })

  it('returns null when the object is never closed', () => {
    expect(extractJsonObject('{"a":1')).toBeNull()
  })
})

/* ── parseAILayoutResponse ───────────────────────────────────────────────── */

describe('parseAILayoutResponse', () => {
  it('accepts a well-formed layout', () => {
    const result = parseAILayoutResponse(response(VALID))

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.items).toHaveLength(3)
  })

  it('accepts one wrapped in prose and fences', () => {
    const result = parseAILayoutResponse('```json\n' + response(VALID) + '\n```')
    expect(result.ok).toBe(true)
  })

  it('reports a missing object rather than throwing', () => {
    const result = parseAILayoutResponse('sorry, no')

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/without any JSON/i)
  })

  it('reports malformed JSON rather than throwing', () => {
    const result = parseAILayoutResponse('{"mode": "grid",}')

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/could not be parsed/i)
  })

  it('rejects an unknown mode', () => {
    const result = parseAILayoutResponse(response({ ...VALID, mode: 'masonry' }))

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('mode')
  })

  it('rejects a layout with no items', () => {
    const result = parseAILayoutResponse(response({ ...VALID, items: [] }))
    expect(result.ok).toBe(false)
  })

  it('rejects an item whose name is not a string', () => {
    const result = parseAILayoutResponse(response({ ...VALID, items: [{ name: 42 }] }))
    expect(result.ok).toBe(false)
  })

  it('rejects a response with no explanation, so the UI always has something to show', () => {
    const { explanation: _explanation, ...withoutExplanation } = VALID
    const result = parseAILayoutResponse(response(withoutExplanation))
    expect(result.ok).toBe(false)
  })

  it('rejects an absurd number of items instead of trying to render them', () => {
    const items = Array.from({ length: 40 }, (_, i) => ({ name: `item-${i}` }))
    const result = parseAILayoutResponse(response({ ...VALID, items }))
    expect(result.ok).toBe(false)
  })
})

/* ── areaIssues ──────────────────────────────────────────────────────────── */

describe('areaIssues', () => {
  it('passes a rectangular map', () => {
    expect(areaIssues(['header header', 'side main'])).toEqual([])
  })

  it('passes a region spanning two rows', () => {
    expect(areaIssues(['side header', 'side main'])).toEqual([])
  })

  it('passes a map with empty cells', () => {
    expect(areaIssues(['header header', '. main'])).toEqual([])
  })

  it('catches rows of different widths', () => {
    expect(areaIssues(['a b c', 'd e'])[0]).toMatch(/same number of cells/i)
  })

  it('catches an L-shaped region, which CSS would drop silently', () => {
    expect(areaIssues(['a a', 'a b', 'c b'])[0]).toMatch(/not a rectangle/i)
  })

  it('catches a region split across the grid', () => {
    expect(areaIssues(['a b a'])[0]).toMatch(/not a rectangle/i)
  })

  it('says nothing about an empty map', () => {
    expect(areaIssues([])).toEqual([])
  })
})

/* ── mergeAILayout ───────────────────────────────────────────────────────── */

describe('mergeAILayout', () => {
  it('applies tracks, areas and gap', () => {
    const next = mergeAILayout(state(), VALID)

    expect(next.mode).toBe('grid')
    expect(next.grid.columns).toEqual(['200px', '1fr'])
    expect(next.grid.areas).toEqual(['header header', 'side main'])
    expect(next.grid.useAreas).toBe(true)
    expect(next.grid.rowGap).toBe('16px')
    expect(next.grid.columnGap).toBe('16px')
    expect(next.items.map((item) => item.name)).toEqual(['header', 'side', 'main'])
  })

  it('never mutates the state it was given, so Discard costs nothing', () => {
    const before = state({ items: [createItem('old')] })
    const snapshot = JSON.stringify(before)

    mergeAILayout(before, VALID)

    expect(JSON.stringify(before)).toBe(snapshot)
  })

  it('keeps hand-set values on an item the model happened to name again', () => {
    const existing = createItem('main', {
      alignSelf: 'center',
      subgrid: {
        enabled: true,
        columnsSubgrid: true,
        rowsSubgrid: false,
        columns: [],
        rows: ['auto'],
        childCount: 3,
      },
    })

    const next = mergeAILayout(state({ items: [existing] }), VALID)
    const main = next.items.find((item) => item.name === 'main')

    expect(main?.alignSelf).toBe('center')
    expect(main?.subgrid.enabled).toBe(true)
    expect(main?.subgrid.childCount).toBe(3)
  })

  it('refuses an invalid area map and keeps the previous one', () => {
    const before = state({
      grid: { ...defaultGrid(), areas: ['a a', 'b b'], useAreas: true },
    })

    const next = mergeAILayout(before, { ...VALID, areas: ['a a', 'b'] })

    expect(next.grid.useAreas).toBe(false)
    expect(next.grid.areas).toEqual(['a a', 'b b'])
  })

  it('sanitises names, so a model cannot inject a broken selector', () => {
    const next = mergeAILayout(state(), {
      ...VALID,
      areas: undefined,
      items: [{ name: 'Main Content!' }, { name: '2 columns' }],
    })

    expect(next.items.map((item) => item.name)).toEqual(['main-content', 'area-2-columns'])
  })

  it('de-duplicates names the model repeated', () => {
    const next = mergeAILayout(state(), {
      ...VALID,
      areas: undefined,
      items: [{ name: 'main' }, { name: 'main' }],
    })

    expect(next.items.map((item) => item.name)).toEqual(['main', 'main-2'])
  })

  it('leaves tracks alone when the model omitted them', () => {
    const before = state({ grid: { ...defaultGrid(), columns: ['5fr'] } })
    const next = mergeAILayout(before, { ...VALID, columns: undefined })

    expect(next.grid.columns).toEqual(['5fr'])
  })

  it('carries flex values across in flex mode', () => {
    const next = mergeAILayout(state(), {
      mode: 'flex',
      gap: '12px',
      items: [{ name: 'body', flexGrow: 2, flexBasis: '20ch' }],
      explanation: 'One row.',
    })

    expect(next.mode).toBe('flex')
    expect(next.flex.rowGap).toBe('12px')
    expect(next.items[0]?.flexGrow).toBe(2)
    expect(next.items[0]?.flexBasis).toBe('20ch')
  })
})

/* ── Providers ───────────────────────────────────────────────────────────── */

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response
}

describe('createOllamaProvider', () => {
  it('reports availability from /api/tags', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ models: [] }))
    const provider = createOllamaProvider({ baseUrl: 'http://localhost:11434', model: 'x' }, fetchImpl)

    await expect(provider.isAvailable()).resolves.toBe(true)
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:11434/api/tags',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('treats a refused connection as unavailable rather than an exception', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const provider = createOllamaProvider(undefined, fetchImpl)

    await expect(provider.isAvailable()).resolves.toBe(false)
  })

  it('treats a non-ok probe as unavailable', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, false, 500))
    const provider = createOllamaProvider(undefined, fetchImpl)

    await expect(provider.isAvailable()).resolves.toBe(false)
  })

  it('trims a trailing slash off the base URL', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}))
    const provider = createOllamaProvider({ baseUrl: 'http://localhost:11434/', model: 'x' }, fetchImpl)

    await provider.isAvailable()

    expect(fetchImpl.mock.calls[0]?.[0]).toBe('http://localhost:11434/api/tags')
  })

  it('sends the system prompt and asks for JSON', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: { content: response(VALID) } }))
    const provider = createOllamaProvider({ baseUrl: 'http://host', model: 'llama3.1:8b' }, fetchImpl)

    const raw = await provider.complete({ prompt: 'a dashboard', state: state() })
    const body = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string)

    expect(body.model).toBe('llama3.1:8b')
    expect(body.stream).toBe(false)
    expect(body.format).toBe('json')
    expect(body.messages[0]).toEqual({ role: 'system', content: LAYOUT_SYSTEM_PROMPT })
    expect(body.messages[1].content).toContain('a dashboard')
    expect(parseAILayoutResponse(raw).ok).toBe(true)
  })

  it('throws with the status when the model errors', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, false, 404))
    const provider = createOllamaProvider(undefined, fetchImpl)

    await expect(provider.complete({ prompt: 'x', state: state() })).rejects.toThrow('404')
  })

  it('throws on an empty message instead of returning nothing', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: { content: '' } }))
    const provider = createOllamaProvider(undefined, fetchImpl)

    await expect(provider.complete({ prompt: 'x', state: state() })).rejects.toThrow(/empty/i)
  })
})

describe('resolveProvider', () => {
  function stub(id: string, available: boolean): LayoutAIProvider {
    return {
      id,
      label: id,
      hint: '',
      isAvailable: async () => available,
      complete: async () => '{}',
    }
  }

  it('picks the first reachable provider', async () => {
    const found = await resolveProvider([stub('a', false), stub('b', true)])
    expect(found?.id).toBe('b')
  })

  it('prefers the earlier provider when both are reachable', async () => {
    const found = await resolveProvider([stub('a', true), stub('b', true)])
    expect(found?.id).toBe('a')
  })

  it('returns null when nothing is reachable, which is the offline path', async () => {
    const found = await resolveProvider([stub('a', false)])
    expect(found).toBeNull()
  })

  it('returns null for an empty list', async () => {
    expect(await resolveProvider([])).toBeNull()
  })
})
