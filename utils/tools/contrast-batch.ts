import { contrastRatio, formatRatio, WCAG_THRESHOLDS } from './color'
import type { ParsedColorToken } from './token-parser'

// ── Types ──────────────────────────────────────────────────────────────────

export type TokenRole = 'foreground' | 'background' | 'unassigned'

export type WcagLevel = 'aa' | 'aaa'
export type TextSize = 'normal' | 'large'

export interface TokenWithRole extends ParsedColorToken {
  role: TokenRole
}

export interface ContrastPair {
  foreground: TokenWithRole
  background: TokenWithRole
  ratio: number
  formattedRatio: string
  passesAaNormal: boolean
  passesAaLarge: boolean
  passesAaaNormal: boolean
}

export type SortField = 'ratio' | 'foreground' | 'background'
export type SortDirection = 'asc' | 'desc'

export interface FilterOptions {
  showOnly: 'all' | 'pass' | 'fail'
  level: WcagLevel
  textSize: TextSize
}

// ── Naming-convention heuristics ───────────────────────────────────────────

const FG_PATTERNS = [
  /\btext\b/i,
  /\bfg\b/i,
  /\bforeground\b/i,
  /\bfont\b/i,
  /\blabel\b/i,
  /\bheading\b/i,
  /\btitle\b/i,
  /\bbody\b/i,
  /\bcopy\b/i,
  /\bink\b/i,
  /\bon-/i,
]

const BG_PATTERNS = [
  /\bbg\b/i,
  /\bbackground\b/i,
  /\bsurface\b/i,
  /\bcanvas\b/i,
  /\bpaper\b/i,
  /\bfill\b/i,
  /\bbase\b/i,
]

function inferRole(token: ParsedColorToken): TokenRole {
  const searchable = [...token.path, token.name].join(' ')

  for (const pattern of FG_PATTERNS) {
    if (pattern.test(searchable)) return 'foreground'
  }
  for (const pattern of BG_PATTERNS) {
    if (pattern.test(searchable)) return 'background'
  }

  return 'unassigned'
}

/**
 * Assigns roles to tokens using naming-convention heuristics. Tokens that
 * match neither foreground nor background patterns are marked 'unassigned'
 * and included in both sets when generating the matrix.
 */
export function assignRoles(tokens: ParsedColorToken[]): TokenWithRole[] {
  return tokens.map((token) => ({
    ...token,
    role: inferRole(token),
  }))
}

// ── Contrast matrix ────────────────────────────────────────────────────────

/**
 * Generates every foreground × background contrast pair. Tokens with role
 * 'unassigned' appear in both sets. Self-pairs (same hex) are excluded.
 */
export function generateMatrix(tokens: TokenWithRole[]): ContrastPair[] {
  const fgTokens = tokens.filter((t) => t.role === 'foreground' || t.role === 'unassigned')
  const bgTokens = tokens.filter((t) => t.role === 'background' || t.role === 'unassigned')

  const pairs: ContrastPair[] = []

  for (const fg of fgTokens) {
    for (const bg of bgTokens) {
      if (fg.hex === bg.hex) continue
      // Avoid duplicate pairs when a token appears in both sets
      if (fg === bg) continue

      const ratio = contrastRatio(fg.hex, bg.hex)
      pairs.push({
        foreground: fg,
        background: bg,
        ratio,
        formattedRatio: formatRatio(ratio),
        passesAaNormal: ratio >= WCAG_THRESHOLDS.aaNormal,
        passesAaLarge: ratio >= WCAG_THRESHOLDS.aaLarge,
        passesAaaNormal: ratio >= WCAG_THRESHOLDS.aaaNormal,
      })
    }
  }

  return pairs
}

// ── Filtering & sorting ────────────────────────────────────────────────────

function thresholdForFilter(level: WcagLevel, textSize: TextSize): number {
  if (level === 'aaa') return WCAG_THRESHOLDS.aaaNormal
  return textSize === 'large' ? WCAG_THRESHOLDS.aaLarge : WCAG_THRESHOLDS.aaNormal
}

function pairPassesFilter(pair: ContrastPair, level: WcagLevel, textSize: TextSize): boolean {
  const threshold = thresholdForFilter(level, textSize)
  return pair.ratio >= threshold
}

export function filterPairs(pairs: ContrastPair[], options: FilterOptions): ContrastPair[] {
  if (options.showOnly === 'all') return pairs

  return pairs.filter((pair) => {
    const passes = pairPassesFilter(pair, options.level, options.textSize)
    return options.showOnly === 'pass' ? passes : !passes
  })
}

export function sortPairs(
  pairs: ContrastPair[],
  field: SortField,
  direction: SortDirection,
): ContrastPair[] {
  const sorted = [...pairs]
  const dir = direction === 'asc' ? 1 : -1

  sorted.sort((a, b) => {
    switch (field) {
      case 'ratio':
        return (a.ratio - b.ratio) * dir
      case 'foreground':
        return a.foreground.name.localeCompare(b.foreground.name) * dir
      case 'background':
        return b.background.name.localeCompare(a.background.name) * dir
      default:
        return 0
    }
  })

  return sorted
}

// ── Summary statistics ─────────────────────────────────────────────────────

export interface MatrixSummary {
  total: number
  passAaNormal: number
  failAaNormal: number
  passAaLarge: number
  failAaLarge: number
  passAaaNormal: number
  failAaaNormal: number
}

export function summarise(pairs: ContrastPair[]): MatrixSummary {
  return {
    total: pairs.length,
    passAaNormal: pairs.filter((p) => p.passesAaNormal).length,
    failAaNormal: pairs.filter((p) => !p.passesAaNormal).length,
    passAaLarge: pairs.filter((p) => p.passesAaLarge).length,
    failAaLarge: pairs.filter((p) => !p.passesAaLarge).length,
    passAaaNormal: pairs.filter((p) => p.passesAaaNormal).length,
    failAaaNormal: pairs.filter((p) => !p.passesAaaNormal).length,
  }
}
