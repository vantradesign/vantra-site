export interface BezierPoints {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface EasingPreset {
  value: string
  label: string
  points: BezierPoints
}

export { EASING_FAMILIES, ALL_PRESETS, findPreset, presetToPoints } from './easing-presets'
export type { EasingPresetEntry, EasingFamily } from './easing-presets'

import { ALL_PRESETS, presetToPoints } from './easing-presets'

/** Flat preset list in the legacy shape, derived from the canonical data. */
export const EASING_PRESETS: EasingPreset[] = ALL_PRESETS.map((p) => ({
  value: p.id,
  label: p.label,
  points: presetToPoints(p),
}))

export function formatCubicBezier({ x1, y1, x2, y2 }: BezierPoints): string {
  const trim = (value: number) => String(Number(value.toFixed(3)))
  return `cubic-bezier(${trim(x1)}, ${trim(y1)}, ${trim(x2)}, ${trim(y2)})`
}

/** Cubic bezier from (0,0) to (1,1), sampled at parameter t. */
export function bezierPoint(points: BezierPoints, t: number): { x: number; y: number } {
  const inverse = 1 - t
  const a = inverse ** 3
  const b = 3 * inverse ** 2 * t
  const c = 3 * inverse * t ** 2
  const d = t ** 3

  return {
    x: b * points.x1 + c * points.x2 + d,
    y: b * points.y1 + c * points.y2 + d,
  }
}

export function matchPreset(points: BezierPoints): EasingPreset | undefined {
  const near = (a: number, b: number) => Math.abs(a - b) < 0.005

  return EASING_PRESETS.find(
    (p) =>
      near(p.points.x1, points.x1) &&
      near(p.points.y1, points.y1) &&
      near(p.points.x2, points.x2) &&
      near(p.points.y2, points.y2),
  )
}
