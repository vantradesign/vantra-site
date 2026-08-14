import type { BezierPoints } from './easing'

export interface EasingPresetEntry {
  /** Stable identifier, used as the radio value and for matchPreset lookups. */
  id: string
  /** Human-readable label shown in the UI. */
  label: string
  /** The four cubic-bezier control-point values. */
  cubicBezier: [number, number, number, number]
}

export interface EasingFamily {
  /** Family identifier (lowercase, kebab-case). */
  id: string
  /** Display name for the group header. */
  label: string
  /** Optional note shown below the family label. */
  note?: string
  presets: EasingPresetEntry[]
}

/* ------------------------------------------------------------------ */
/*  Canonical values sourced from easings.net / Penner equations.      */
/*  Do not approximate — users expect exact matches.                   */
/* ------------------------------------------------------------------ */

export const EASING_FAMILIES: EasingFamily[] = [
  {
    id: 'css',
    label: 'CSS Keywords',
    presets: [
      { id: 'linear', label: 'linear', cubicBezier: [0, 0, 1, 1] },
      { id: 'ease', label: 'ease', cubicBezier: [0.25, 0.1, 0.25, 1] },
      { id: 'ease-in', label: 'ease-in', cubicBezier: [0.42, 0, 1, 1] },
      { id: 'ease-out', label: 'ease-out', cubicBezier: [0, 0, 0.58, 1] },
      { id: 'ease-in-out', label: 'ease-in-out', cubicBezier: [0.42, 0, 0.58, 1] },
    ],
  },
  {
    id: 'vantra',
    label: 'Vantra',
    presets: [
      { id: 'vantra', label: 'Vantra Signature', cubicBezier: [0.2, 0, 0, 1] },
    ],
  },
  {
    id: 'sine',
    label: 'Sine',
    presets: [
      { id: 'ease-in-sine', label: 'ease-in-sine', cubicBezier: [0.12, 0, 0.39, 0] },
      { id: 'ease-out-sine', label: 'ease-out-sine', cubicBezier: [0.61, 1, 0.88, 1] },
      { id: 'ease-in-out-sine', label: 'ease-in-out-sine', cubicBezier: [0.37, 0, 0.63, 1] },
    ],
  },
  {
    id: 'quad',
    label: 'Quad',
    presets: [
      { id: 'ease-in-quad', label: 'ease-in-quad', cubicBezier: [0.55, 0.085, 0.68, 0.53] },
      { id: 'ease-out-quad', label: 'ease-out-quad', cubicBezier: [0.25, 0.46, 0.45, 0.94] },
      { id: 'ease-in-out-quad', label: 'ease-in-out-quad', cubicBezier: [0.455, 0.03, 0.515, 0.955] },
    ],
  },
  {
    id: 'cubic',
    label: 'Cubic',
    presets: [
      { id: 'ease-in-cubic', label: 'ease-in-cubic', cubicBezier: [0.55, 0.055, 0.675, 0.19] },
      { id: 'ease-out-cubic', label: 'ease-out-cubic', cubicBezier: [0.215, 0.61, 0.355, 1] },
      { id: 'ease-in-out-cubic', label: 'ease-in-out-cubic', cubicBezier: [0.645, 0.045, 0.355, 1] },
    ],
  },
  {
    id: 'quart',
    label: 'Quart',
    presets: [
      { id: 'ease-in-quart', label: 'ease-in-quart', cubicBezier: [0.895, 0.03, 0.685, 0.22] },
      { id: 'ease-out-quart', label: 'ease-out-quart', cubicBezier: [0.165, 0.84, 0.44, 1] },
      { id: 'ease-in-out-quart', label: 'ease-in-out-quart', cubicBezier: [0.77, 0, 0.175, 1] },
    ],
  },
  {
    id: 'quint',
    label: 'Quint',
    presets: [
      { id: 'ease-in-quint', label: 'ease-in-quint', cubicBezier: [0.755, 0.05, 0.855, 0.06] },
      { id: 'ease-out-quint', label: 'ease-out-quint', cubicBezier: [0.23, 1, 0.32, 1] },
      { id: 'ease-in-out-quint', label: 'ease-in-out-quint', cubicBezier: [0.86, 0, 0.07, 1] },
    ],
  },
  {
    id: 'expo',
    label: 'Expo',
    presets: [
      { id: 'ease-in-expo', label: 'ease-in-expo', cubicBezier: [0.95, 0.05, 0.795, 0.035] },
      { id: 'ease-out-expo', label: 'ease-out-expo', cubicBezier: [0.19, 1, 0.22, 1] },
      { id: 'ease-in-out-expo', label: 'ease-in-out-expo', cubicBezier: [1, 0, 0, 1] },
    ],
  },
  {
    id: 'circ',
    label: 'Circ',
    presets: [
      { id: 'ease-in-circ', label: 'ease-in-circ', cubicBezier: [0.6, 0.04, 0.98, 0.335] },
      { id: 'ease-out-circ', label: 'ease-out-circ', cubicBezier: [0.075, 0.82, 0.165, 1] },
      { id: 'ease-in-out-circ', label: 'ease-in-out-circ', cubicBezier: [0.785, 0.135, 0.15, 0.86] },
    ],
  },
  {
    id: 'back',
    label: 'Back',
    note: 'These curves overshoot past 0 or 1. Avoid on properties like opacity that clamp outside 0–1.',
    presets: [
      { id: 'ease-in-back', label: 'ease-in-back', cubicBezier: [0.36, 0, 0.66, -0.56] },
      { id: 'ease-out-back', label: 'ease-out-back', cubicBezier: [0.34, 1.56, 0.64, 1] },
      { id: 'ease-in-out-back', label: 'ease-in-out-back', cubicBezier: [0.68, -0.6, 0.32, 1.6] },
    ],
  },
]

/** Flat list of every preset across all families. */
export const ALL_PRESETS: EasingPresetEntry[] = EASING_FAMILIES.flatMap((f) => f.presets)

/** Convert a preset's cubicBezier tuple to the BezierPoints shape used by the editor. */
export function presetToPoints(entry: EasingPresetEntry): BezierPoints {
  const [x1, y1, x2, y2] = entry.cubicBezier
  return { x1, y1, x2, y2 }
}

/** Find a preset matching the given BezierPoints (within tolerance). */
export function findPreset(points: BezierPoints): EasingPresetEntry | undefined {
  const near = (a: number, b: number) => Math.abs(a - b) < 0.005

  return ALL_PRESETS.find(
    (p) =>
      near(p.cubicBezier[0], points.x1) &&
      near(p.cubicBezier[1], points.y1) &&
      near(p.cubicBezier[2], points.x2) &&
      near(p.cubicBezier[3], points.y2),
  )
}
