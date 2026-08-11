export interface ScaleRatio {
  label: string
  value: number
}

export const TYPE_RATIOS: ScaleRatio[] = [
  { label: 'Minor Second', value: 1.067 },
  // Added for the fluid mode: a small-screen scale almost always wants a
  // gentler ratio than the large-screen one, and 1.25 is already too steep
  // at 320px once the cover step is four exponents up.
  { label: 'Minor Third', value: 1.2 },
  { label: 'Major Third', value: 1.25 },
  { label: 'Perfect Fourth', value: 1.333 },
  { label: 'Golden Ratio', value: 1.618 },
]

export const TYPE_STEP_NAMES = [
  'caption',
  'body',
  'body-lg',
  'lead',
  'title',
  'display',
  'cover',
  'cover-xl',
] as const

export interface TypeStep {
  name: string
  exponent: number
  px: number
  rem: number
}

/**
 * Eight steps, one below the base so the caption tier is part of the scale.
 */
export function buildTypeScale(base: number, ratio: number): TypeStep[] {
  return TYPE_STEP_NAMES.map((name, index) => {
    const exponent = index - 1
    const px = base * ratio ** exponent

    return {
      name,
      exponent,
      px: round(px, 2),
      rem: round(px / base, 3),
    }
  })
}

export interface SpacingStep {
  step: number
  px: number
  rem: number
  name: string
}

const SPACING_MULTIPLIERS = [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16]
const SPACING_NAMES = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']

export function buildSpacingScale(gridUnit: 4 | 8): SpacingStep[] {
  return SPACING_MULTIPLIERS.map((multiplier, index) => {
    const px = round(gridUnit * multiplier, 2)

    return {
      step: index + 1,
      px,
      rem: round(px / 16, 4),
      name: SPACING_NAMES[index]!,
    }
  })
}

export type Unit = 'px' | 'rem' | 'em' | 'pt'

const PT_PER_PX = 0.75

export function toPx(value: number, unit: Unit, rootFontSize: number): number {
  switch (unit) {
    case 'px':
      return value
    case 'rem':
    case 'em':
      return value * rootFontSize
    case 'pt':
      return value / PT_PER_PX
  }
}

export function fromPx(px: number, unit: Unit, rootFontSize: number): number {
  switch (unit) {
    case 'px':
      return px
    case 'rem':
    case 'em':
      return px / rootFontSize
    case 'pt':
      return px * PT_PER_PX
  }
}

/** Trims trailing zeros so 1.500 reads as 1.5 and 16.000 as 16. */
export function formatUnit(value: number, decimals = 3): string {
  if (!Number.isFinite(value)) return '0'
  return String(Number(value.toFixed(decimals)))
}

export function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export interface ClampInput {
  minValue: number
  maxValue: number
  minViewport: number
  maxViewport: number
}

export interface ClampResult {
  slope: number
  intercept: number
  preferred: string
  css: string
}

/**
 * Standard fluid formula: value scales linearly between the two viewports,
 * expressed in rem plus vw so it still responds to browser text zoom.
 */
export function computeClamp(
  { minValue, maxValue, minViewport, maxViewport }: ClampInput,
  rootFontSize = 16,
): ClampResult {
  const viewportSpan = maxViewport - minViewport
  const slope = viewportSpan === 0 ? 0 : (maxValue - minValue) / viewportSpan
  const intercept = minValue - slope * minViewport

  const slopeVw = round(slope * 100, 4)
  const interceptRem = round(intercept / rootFontSize, 4)
  const minRem = round(minValue / rootFontSize, 4)
  const maxRem = round(maxValue / rootFontSize, 4)

  const preferred = `${interceptRem}rem + ${slopeVw}vw`

  return {
    slope,
    intercept,
    preferred,
    css: `clamp(${minRem}rem, ${preferred}, ${maxRem}rem)`,
  }
}

export interface ViewportRange {
  minViewport: number
  maxViewport: number
}

export interface FluidStep {
  name: string
  /** Value at the small end, in px. */
  minPx: number
  /** Value at the large end, in px. */
  maxPx: number
  clamp: ClampResult
}

export interface FluidTypeInput extends ViewportRange {
  minBase: number
  maxBase: number
  /** Ratio applied at the small end. Usually gentler than the large one. */
  minRatio: number
  maxRatio: number
}

/**
 * The same eight steps as buildTypeScale, but each one interpolated between a
 * small-screen and a large-screen size. Two ratios rather than one, because a
 * scale that reads well at 1440px is almost always too steep at 320px.
 */
export function buildFluidTypeScale(input: FluidTypeInput): FluidStep[] {
  const { minBase, maxBase, minRatio, maxRatio } = input

  return TYPE_STEP_NAMES.map((name, index) => {
    const exponent = index - 1
    const minPx = round(minBase * minRatio ** exponent, 2)
    const maxPx = round(maxBase * maxRatio ** exponent, 2)

    return {
      name,
      minPx,
      maxPx,
      clamp: computeClamp({
        minValue: minPx,
        maxValue: maxPx,
        minViewport: input.minViewport,
        maxViewport: input.maxViewport,
      }),
    }
  })
}

export interface FluidSpacingInput extends ViewportRange {
  minUnit: number
  maxUnit: number
}

/** Spacing counterpart: one grid unit at each end, same ten multipliers. */
export function buildFluidSpacingScale(input: FluidSpacingInput): FluidStep[] {
  const { minUnit, maxUnit } = input

  return SPACING_MULTIPLIERS.map((multiplier, index) => {
    const minPx = round(minUnit * multiplier, 2)
    const maxPx = round(maxUnit * multiplier, 2)

    return {
      name: SPACING_NAMES[index]!,
      minPx,
      maxPx,
      clamp: computeClamp({
        minValue: minPx,
        maxValue: maxPx,
        minViewport: input.minViewport,
        maxViewport: input.maxViewport,
      }),
    }
  })
}

/** Resolved px value of a fluid step at a given viewport width. */
export function fluidStepAt(step: FluidStep, range: ViewportRange, viewport: number): number {
  return clampAtViewport(
    {
      minValue: step.minPx,
      maxValue: step.maxPx,
      minViewport: range.minViewport,
      maxViewport: range.maxViewport,
    },
    viewport,
  )
}

export function clampAtViewport(input: ClampInput, viewport: number): number {
  const { minValue, maxValue, minViewport, maxViewport } = input
  const lower = Math.min(minValue, maxValue)
  const upper = Math.max(minValue, maxValue)

  if (maxViewport === minViewport) return upper

  const progress = (viewport - minViewport) / (maxViewport - minViewport)
  const raw = minValue + (maxValue - minValue) * progress

  return Math.min(upper, Math.max(lower, raw))
}
