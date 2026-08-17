/**
 * Shared token schema — the central data layer every tool reads from and writes
 * to. Modelled after the W3C Design Tokens Community Group format (DTCG), but
 * kept flat enough to live comfortably in localStorage.
 *
 * Primitives are raw values (hex colours, px sizes, numbers).
 * Semantic tokens reference primitives by key.
 * Component tokens reference semantics.
 *
 * Every tool that writes tokens writes them here. Every tool that reads tokens
 * (focus-ring generator reading background colours, dark-mode previewer reading
 * the light palette) reads from here. That shared root is the differentiator
 * over standalone generators.
 */

// ── Primitive token types ──────────────────────────────────────────────────

export interface ColorPrimitive {
  $type: 'color'
  $value: string
  /** OKLCH representation for perceptual operations. */
  oklch?: { l: number; c: number; h: number }
  /** Contrast ratio against #ffffff. */
  contrastOnWhite?: number
  /** Contrast ratio against #000000. */
  contrastOnBlack?: number
}

export interface ZIndexToken {
  $type: 'zIndex'
  $value: number
  /** Human-readable label, e.g. "Dropdown", "Modal". */
  label: string
}

export interface BreakpointToken {
  $type: 'breakpoint'
  $value: number
  /** Unit, almost always 'px'. */
  unit: 'px' | 'em' | 'rem'
}

export interface FocusRingConfig {
  $type: 'focusRing'
  /** CSS color for the primary ring. */
  color: string
  /** Offset from the element edge in px. */
  offset: number
  /** Ring width in px. */
  width: number
  /** Style: solid or double (paper halo). */
  style: 'solid' | 'double'
  /** Background color the ring sits on — for contrast checking. */
  background: string
  /** Outer halo color for the double style. */
  haloColor?: string
}

// ── Color ramp as a group of primitives ────────────────────────────────────

export interface ColorRamp {
  /** The source hex that seeded the ramp. */
  source: string
  /** Name used as prefix in token keys, e.g. "brand". */
  name: string
  steps: Record<string, ColorPrimitive>
}

// ── Dark-mode layer ────────────────────────────────────────────────────────

export interface DarkModeMapping {
  /** Light-mode token key → dark-mode override hex. */
  [lightKey: string]: string
}

// ── The schema itself ──────────────────────────────────────────────────────

export interface TokenSchema {
  /** Schema version for migration safety. */
  $version: 1
  color: {
    /** Raw colour values keyed by name, e.g. "brand-500". */
    primitives: Record<string, ColorPrimitive>
    /** Semantic aliases, e.g. "background" → "brand-50". */
    semantic: Record<string, string>
    /** Saved ramps for quick re-access. */
    ramps: ColorRamp[]
  }
  zIndex: Record<string, ZIndexToken>
  breakpoints: Record<string, BreakpointToken>
  focusRing: FocusRingConfig | null
  darkMode: DarkModeMapping
}

// ── Default schema ─────────────────────────────────────────────────────────

/** Vantra's own palette as the seed — so the tools eat their own cooking. */
export function createDefaultSchema(): TokenSchema {
  return {
    $version: 1,
    color: {
      primitives: {
        paper: { $type: 'color', $value: '#f5f2f3' },
        ink: { $type: 'color', $value: '#001619' },
        'ink-muted': { $type: 'color', $value: '#4a585a' },
        'ink-faint': { $type: 'color', $value: '#626e70' },
        blue: { $type: 'color', $value: '#021f94' },
        cyan: { $type: 'color', $value: '#50e8f4' },
        'cyan-soft': { $type: 'color', $value: '#c7f8fe' },
      },
      semantic: {
        background: 'paper',
        foreground: 'ink',
        'foreground-muted': 'ink-muted',
        accent: 'blue',
        'accent-light': 'cyan',
      },
      ramps: [],
    },
    zIndex: {},
    breakpoints: {},
    focusRing: null,
    darkMode: {},
  }
}

// ── localStorage key ───────────────────────────────────────────────────────

export const TOKEN_SCHEMA_KEY = 'vantra-token-schema'
