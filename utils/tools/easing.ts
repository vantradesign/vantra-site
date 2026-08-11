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

export const EASING_PRESETS: EasingPreset[] = [
  { value: 'ease', label: 'ease', points: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 } },
  { value: 'ease-in', label: 'ease-in', points: { x1: 0.42, y1: 0, x2: 1, y2: 1 } },
  { value: 'ease-out', label: 'ease-out', points: { x1: 0, y1: 0, x2: 0.58, y2: 1 } },
  { value: 'ease-in-out', label: 'ease-in-out', points: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 } },
  // Matches --ease-editorial in assets/css/main.css.
  { value: 'vantra', label: 'Vantra Signature', points: { x1: 0.2, y1: 0, x2: 0, y2: 1 } },
]

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
    (preset) =>
      near(preset.points.x1, points.x1) &&
      near(preset.points.y1, points.y1) &&
      near(preset.points.x2, points.x2) &&
      near(preset.points.y2, points.y2),
  )
}
