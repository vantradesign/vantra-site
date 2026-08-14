import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { contrastRatio } from './color'
import {
  assignRoles,
  generateMatrix,
  filterPairs,
  sortPairs,
  summarise,
} from './contrast-batch'
import { parseJsonTokens, parseCssTokens } from './token-parser'
import type { ParsedColorToken } from './token-parser'

// ── Test data ──────────────────────────────────────────────────────────────

function makeToken(overrides: Partial<ParsedColorToken> & { name: string; hex: string }): ParsedColorToken {
  return {
    path: [overrides.name],
    rawValue: overrides.hex,
    source: 'json' as const,
    ...overrides,
  }
}

const TEXT_TOKEN = makeToken({ name: 'text-primary', hex: '#1a1a1a' })
const BG_TOKEN = makeToken({ name: 'background', hex: '#ffffff' })
const SURFACE_TOKEN = makeToken({ name: 'surface', hex: '#f5f5f5' })
const BRAND_TOKEN = makeToken({ name: 'brand-primary', hex: '#2563eb' })

// ── Role assignment ────────────────────────────────────────────────────────

describe('assignRoles', () => {
  it('assigns text-* tokens as foreground', () => {
    const result = assignRoles([TEXT_TOKEN])
    expect(result[0]!.role).toBe('foreground')
  })

  it('assigns background-* tokens as background', () => {
    const result = assignRoles([BG_TOKEN])
    expect(result[0]!.role).toBe('background')
  })

  it('assigns surface-* tokens as background', () => {
    const result = assignRoles([SURFACE_TOKEN])
    expect(result[0]!.role).toBe('background')
  })

  it('assigns unrecognised tokens as unassigned', () => {
    const result = assignRoles([BRAND_TOKEN])
    expect(result[0]!.role).toBe('unassigned')
  })
})

// ── Matrix generation ──────────────────────────────────────────────────────

describe('generateMatrix', () => {
  it('generates all fg×bg pairs', () => {
    const tokens = assignRoles([TEXT_TOKEN, BG_TOKEN, SURFACE_TOKEN])
    const pairs = generateMatrix(tokens)
    // text-primary (fg) × background (bg) + text-primary (fg) × surface (bg)
    expect(pairs.length).toBe(2)
  })

  it('excludes self-pairs with identical hex', () => {
    const whiteText = makeToken({ name: 'text-on-dark', hex: '#ffffff' })
    const whiteBg = makeToken({ name: 'background', hex: '#ffffff' })
    const tokens = assignRoles([whiteText, whiteBg])
    // Both have same hex, so no pair
    const pairs = generateMatrix(tokens)
    expect(pairs.every((p) => p.foreground.hex !== p.background.hex)).toBe(true)
  })

  it('includes unassigned tokens in both roles', () => {
    const tokens = assignRoles([BRAND_TOKEN, BG_TOKEN])
    // brand is unassigned → appears as fg against bg, and bg appears as fg against brand? No.
    // brand is unassigned (both), bg is background.
    // fg set: [brand] (unassigned), bg set: [bg, brand] (bg + unassigned)
    // pairs: brand×bg, brand×brand (excluded: same ref)
    // So: 1 pair
    const pairs = generateMatrix(tokens)
    expect(pairs.length).toBe(1)
  })

  it('computes correct WCAG contrast ratios', () => {
    const tokens = assignRoles([TEXT_TOKEN, BG_TOKEN])
    const pairs = generateMatrix(tokens)
    expect(pairs.length).toBe(1)
    const pair = pairs[0]!
    expect(pair.ratio).toBeCloseTo(contrastRatio('#1a1a1a', '#ffffff'), 2)
    expect(pair.passesAaNormal).toBe(true)
    expect(pair.passesAaaNormal).toBe(true)
  })
})

// ── Known WCAG reference pairs ─────────────────────────────────────────────

describe('contrast ratio against known WCAG pairs', () => {
  it('white on white is 1:1', () => {
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 2)
  })

  it('black on white is 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
  })

  it('grey (#767676) on white passes AA at 4.54:1', () => {
    const ratio = contrastRatio('#767676', '#ffffff')
    expect(ratio).toBeGreaterThanOrEqual(4.5)
    expect(ratio).toBeCloseTo(4.54, 1)
  })

  it('grey (#777777) on white fails AA Normal', () => {
    const ratio = contrastRatio('#777777', '#ffffff')
    expect(ratio).toBeLessThan(4.5)
  })
})

// ── Filtering ──────────────────────────────────────────────────────────────

describe('filterPairs', () => {
  const tokens = assignRoles([TEXT_TOKEN, BG_TOKEN, makeToken({ name: 'text-light', hex: '#d1d5db' })])
  const pairs = generateMatrix(tokens)

  it('shows all when filter is "all"', () => {
    const result = filterPairs(pairs, { showOnly: 'all', level: 'aa', textSize: 'normal' })
    expect(result.length).toBe(pairs.length)
  })

  it('filters to pass only', () => {
    const result = filterPairs(pairs, { showOnly: 'pass', level: 'aa', textSize: 'normal' })
    expect(result.every((p) => p.ratio >= 4.5)).toBe(true)
  })

  it('filters to fail only', () => {
    const result = filterPairs(pairs, { showOnly: 'fail', level: 'aa', textSize: 'normal' })
    expect(result.every((p) => p.ratio < 4.5)).toBe(true)
    expect(result.length).toBeGreaterThan(0) // text-light on white should fail
  })
})

// ── Sorting ────────────────────────────────────────────────────────────────

describe('sortPairs', () => {
  const tokens = assignRoles([TEXT_TOKEN, BG_TOKEN, makeToken({ name: 'text-light', hex: '#d1d5db' })])
  const pairs = generateMatrix(tokens)

  it('sorts by ratio ascending', () => {
    const sorted = sortPairs(pairs, 'ratio', 'asc')
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.ratio).toBeGreaterThanOrEqual(sorted[i - 1]!.ratio)
    }
  })

  it('sorts by ratio descending', () => {
    const sorted = sortPairs(pairs, 'ratio', 'desc')
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.ratio).toBeLessThanOrEqual(sorted[i - 1]!.ratio)
    }
  })
})

// ── Summary ────────────────────────────────────────────────────────────────

describe('summarise', () => {
  it('counts pass/fail correctly', () => {
    const tokens = assignRoles([TEXT_TOKEN, BG_TOKEN, makeToken({ name: 'text-light', hex: '#d1d5db' })])
    const pairs = generateMatrix(tokens)
    const summary = summarise(pairs)
    expect(summary.total).toBe(pairs.length)
    expect(summary.passAaNormal + summary.failAaNormal).toBe(summary.total)
  })
})

// ── No-network-call guarantee ──────────────────────────────────────────────

describe('no network calls during upload→parse→check flow', () => {
  const originalFetch = globalThis.fetch
  let fetchCalls: unknown[][]
  let xhrOpenCalls: unknown[][]

  beforeEach(() => {
    fetchCalls = []
    xhrOpenCalls = []

    globalThis.fetch = ((...args: unknown[]) => {
      fetchCalls.push(args)
      return Promise.resolve(new Response())
    }) as typeof fetch

    // XMLHttpRequest may not exist in node, so create a minimal stub
    const FakeXHR = class {
      open(...args: unknown[]) { xhrOpenCalls.push(args) }
      send() {}
    }
    ;(globalThis as Record<string, unknown>).XMLHttpRequest = FakeXHR
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('JSON parse → batch check makes zero fetch/XHR calls', () => {
    const json = JSON.stringify({
      color: {
        bg: { $value: '#ffffff', $type: 'color' },
        text: { $value: '#1a1a1a', $type: 'color' },
        light: { $value: '#d1d5db', $type: 'color' },
      },
    })

    const result = parseJsonTokens(json)
    expect(result.tokens.length).toBeGreaterThan(0)

    const tokens = assignRoles(result.tokens)
    const pairs = generateMatrix(tokens)
    const filtered = filterPairs(pairs, { showOnly: 'fail', level: 'aa', textSize: 'normal' })
    const sorted = sortPairs(filtered, 'ratio', 'asc')
    const summary = summarise(pairs)

    expect(fetchCalls).toHaveLength(0)
    expect(xhrOpenCalls).toHaveLength(0)

    // Sanity: the pipeline actually produced output
    expect(pairs.length).toBeGreaterThan(0)
    expect(summary.total).toBe(pairs.length)
  })

  it('CSS parse → batch check makes zero fetch/XHR calls', () => {
    const css = `
      :root {
        --color-bg: #ffffff;
        --color-text: #1a1a1a;
        --color-muted: #d1d5db;
        --color-alias: var(--color-text);
      }
    `

    const result = parseCssTokens(css)
    expect(result.tokens.length).toBeGreaterThan(0)

    const tokens = assignRoles(result.tokens)
    const pairs = generateMatrix(tokens)
    filterPairs(pairs, { showOnly: 'all', level: 'aa', textSize: 'normal' })
    sortPairs(pairs, 'ratio', 'desc')
    summarise(pairs)

    expect(fetchCalls).toHaveLength(0)
    expect(xhrOpenCalls).toHaveLength(0)
  })
})
