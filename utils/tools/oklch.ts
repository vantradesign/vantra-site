/**
 * OKLCH colour utilities for perceptually even colour ramps.
 *
 * OKLCH is the cylindrical form of OKLAB, a perceptual colour space where
 * equal numeric steps produce equal perceived differences. This makes it
 * superior to HSL for ramp generation: an HSL ramp with even lightness steps
 * produces steps that look uneven, especially in the blue/yellow range.
 *
 * The conversion path is: sRGB → linear RGB → OKLAB → OKLCH, and back.
 */

import type { Rgb } from './color'
import { hexToRgb, rgbToHex, contrastRatio } from './color'
import type { ColorPrimitive } from './token-schema'

export interface Oklch {
  /** Lightness, 0–1. */
  l: number
  /** Chroma, 0–~0.37. */
  c: number
  /** Hue, 0–360. */
  h: number
}

// ── sRGB ↔ linear RGB ──────────────────────────────────────────────────────

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055
}

// ── linear RGB → OKLAB ─────────────────────────────────────────────────────

function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l = Math.cbrt(l_)
  const m = Math.cbrt(m_)
  const s = Math.cbrt(s_)

  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ]
}

// ── OKLAB → linear RGB ─────────────────────────────────────────────────────

function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ]
}

// ── OKLAB ↔ OKLCH ──────────────────────────────────────────────────────────

function oklabToOklch(L: number, a: number, b: number): Oklch {
  const c = Math.sqrt(a * a + b * b)
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0) h += 360
  return { l: L, c, h }
}

function oklchToOklab(oklch: Oklch): [number, number, number] {
  const hRad = (oklch.h * Math.PI) / 180
  return [oklch.l, oklch.c * Math.cos(hRad), oklch.c * Math.sin(hRad)]
}

// ── Public API: hex ↔ OKLCH ────────────────────────────────────────────────

export function hexToOklch(hex: string): Oklch | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null

  const lr = srgbToLinear(rgb.r / 255)
  const lg = srgbToLinear(rgb.g / 255)
  const lb = srgbToLinear(rgb.b / 255)

  const [L, a, b] = linearRgbToOklab(lr, lg, lb)
  return oklabToOklch(L, a, b)
}

export function oklchToHex(oklch: Oklch): string {
  const [L, a, b] = oklchToOklab(oklch)
  const [lr, lg, lb] = oklabToLinearRgb(L, a, b)

  const rgb: Rgb = {
    r: Math.round(Math.min(255, Math.max(0, linearToSrgb(lr) * 255))),
    g: Math.round(Math.min(255, Math.max(0, linearToSrgb(lg) * 255))),
    b: Math.round(Math.min(255, Math.max(0, linearToSrgb(lb) * 255))),
  }

  return rgbToHex(rgb)
}

// ── Perceptually even ramp generation ──────────────────────────────────────

export const OKLCH_RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

/**
 * Target lightness for each step, calibrated for a perceptually even ramp.
 * 50 is nearly white, 950 is nearly black.
 */
const LIGHTNESS_TARGETS: Record<number, number> = {
  50: 0.97,
  100: 0.93,
  200: 0.87,
  300: 0.78,
  400: 0.68,
  500: 0.57,
  600: 0.48,
  700: 0.39,
  800: 0.30,
  900: 0.21,
  950: 0.14,
}

/**
 * Chroma scaling factor per step. At the extremes (very light and very dark),
 * chroma must be reduced to stay in gamut. The mid-range can hold full chroma.
 */
function chromaScale(targetL: number, baseL: number): number {
  // Distance from the base lightness determines how much chroma to keep
  const distance = Math.abs(targetL - baseL)
  // At the extremes, reduce chroma aggressively to stay in sRGB gamut
  if (targetL > 0.90) return 0.15 + 0.2 * (1 - distance)
  if (targetL > 0.80) return 0.35 + 0.3 * (1 - distance)
  if (targetL < 0.20) return 0.40 + 0.3 * (1 - distance)
  if (targetL < 0.30) return 0.55 + 0.25 * (1 - distance)
  // Mid-range: keep most of the chroma
  return 0.75 + 0.25 * (1 - distance * 0.5)
}

/**
 * Clamp an OKLCH colour to sRGB gamut by reducing chroma until all channels
 * are in [0, 255]. This is the standard gamut-mapping strategy for OKLCH.
 */
function clampToSrgb(oklch: Oklch): Oklch {
  let { l, c, h } = oklch
  l = Math.max(0, Math.min(1, l))

  // Binary search for the maximum chroma that stays in gamut
  let lo = 0
  let hi = c

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    const [L, a, b] = oklchToOklab({ l, c: mid, h })
    const [lr, lg, lb] = oklabToLinearRgb(L, a, b)
    const r = linearToSrgb(lr)
    const g = linearToSrgb(lg)
    const bv = linearToSrgb(lb)

    if (r >= -0.001 && r <= 1.001 && g >= -0.001 && g <= 1.001 && bv >= -0.001 && bv <= 1.001) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return { l, c: lo, h }
}

export interface OklchRampStep {
  step: number
  hex: string
  oklch: Oklch
  contrastOnWhite: number
  contrastOnBlack: number
}

/**
 * Generate a perceptually even colour ramp from one source hex.
 * Uses OKLCH to hold hue, scale chroma, and set target lightness.
 */
export function generateOklchRamp(hex: string): OklchRampStep[] {
  const base = hexToOklch(hex)
  if (!base) return []

  return OKLCH_RAMP_STEPS.map((step) => {
    const targetL = LIGHTNESS_TARGETS[step]!
    const scale = chromaScale(targetL, base.l)
    const targetC = base.c * scale

    const clamped = clampToSrgb({ l: targetL, c: targetC, h: base.h })
    const stepHex = oklchToHex(clamped)

    return {
      step,
      hex: stepHex,
      oklch: clamped,
      contrastOnWhite: contrastRatio('#ffffff', stepHex),
      contrastOnBlack: contrastRatio('#000000', stepHex),
    }
  })
}

/**
 * Convert a ramp to ColorPrimitive records for the token schema.
 */
export function rampToTokenPrimitives(
  ramp: OklchRampStep[],
): Record<string, ColorPrimitive> {
  const result: Record<string, ColorPrimitive> = {}

  for (const step of ramp) {
    result[String(step.step)] = {
      $type: 'color',
      $value: step.hex,
      oklch: step.oklch,
      contrastOnWhite: step.contrastOnWhite,
      contrastOnBlack: step.contrastOnBlack,
    }
  }

  return result
}
