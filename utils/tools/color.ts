export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsl {
  h: number
  s: number
  l: number
}

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

export function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value.trim())
}

export function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, '')
  if (!HEX_PATTERN.test(raw)) return null

  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw

  return `#${full.toLowerCase()}`
}

export function hexToRgb(hex: string): Rgb | null {
  const normalized = normalizeHex(hex)
  if (!normalized) return null

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, '0')

  return `#${channel(r)}${channel(g)}${channel(b)}`
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const l = (max + min) / 2

  if (delta === 0) return { h: 0, s: 0, l: l * 100 }

  const s = delta / (1 - Math.abs(2 * l - 1))

  let h: number
  if (max === rn) h = ((gn - bn) / delta) % 6
  else if (max === gn) h = (bn - rn) / delta + 2
  else h = (rn - gn) / delta + 4

  h *= 60
  if (h < 0) h += 360

  return { h, s: s * 100, l: l * 100 }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = Math.min(100, Math.max(0, s)) / 100
  const ln = Math.min(100, Math.max(0, l)) / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const hp = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))

  let rgb: [number, number, number]
  if (hp < 1) rgb = [c, x, 0]
  else if (hp < 2) rgb = [x, c, 0]
  else if (hp < 3) rgb = [0, c, x]
  else if (hp < 4) rgb = [0, x, c]
  else if (hp < 5) rgb = [x, 0, c]
  else rgb = [c, 0, x]

  const m = ln - c / 2

  return {
    r: (rgb[0] + m) * 255,
    g: (rgb[1] + m) * 255,
    b: (rgb[2] + m) * 255,
  }
}

export function hexToHsl(hex: string): Hsl | null {
  const rgb = hexToRgb(hex)
  return rgb ? rgbToHsl(rgb) : null
}

export function hslToHex(hsl: Hsl): string {
  return rgbToHex(hslToRgb(hsl))
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const channel = (value: number) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

/** WCAG 2.1 contrast ratio, 1–21. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)

  return (lighter + 0.05) / (darker + 0.05)
}

export const WCAG_THRESHOLDS = {
  aaNormal: 4.5,
  aaLarge: 3,
  aaaNormal: 7,
} as const

export interface WcagVerdict {
  id: keyof typeof WCAG_THRESHOLDS
  label: string
  requirement: string
  threshold: number
  passes: boolean
}

export function wcagVerdicts(ratio: number): WcagVerdict[] {
  return [
    {
      id: 'aaNormal',
      label: 'AA Normal',
      requirement: 'Body text under 24px',
      threshold: WCAG_THRESHOLDS.aaNormal,
      passes: ratio >= WCAG_THRESHOLDS.aaNormal,
    },
    {
      id: 'aaLarge',
      label: 'AA Large',
      requirement: 'From 24px, or 19px bold',
      threshold: WCAG_THRESHOLDS.aaLarge,
      passes: ratio >= WCAG_THRESHOLDS.aaLarge,
    },
    {
      id: 'aaaNormal',
      label: 'AAA Normal',
      requirement: 'Enhanced, body text',
      threshold: WCAG_THRESHOLDS.aaaNormal,
      passes: ratio >= WCAG_THRESHOLDS.aaaNormal,
    },
  ]
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`
}

/** Better of white/black as text on the given background. */
export function bestTextOn(hex: string): '#ffffff' | '#000000' {
  return contrastRatio('#ffffff', hex) >= contrastRatio('#000000', hex) ? '#ffffff' : '#000000'
}

export interface RampStep {
  step: number
  hex: string
  onWhite: number
  onBlack: number
}

const RAMP_LIGHTNESS: Record<number, number> = {
  50: 97,
  100: 93,
  200: 85,
  300: 74,
  400: 62,
  500: 50,
  600: 41,
  700: 32,
  800: 23,
  900: 14,
}

export const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const

/**
 * Ramp built by holding hue and re-anchoring lightness, with saturation eased
 * down at the pale end so the tints do not read as chalky.
 */
export function generateRamp(hex: string): RampStep[] {
  const base = hexToHsl(hex)
  if (!base) return []

  return RAMP_STEPS.map((step) => {
    const lightness = RAMP_LIGHTNESS[step]!
    const distance = Math.abs(lightness - base.l) / 100
    const saturation =
      lightness > base.l
        ? base.s * (1 - distance * 0.35)
        : Math.min(100, base.s * (1 + distance * 0.12))

    const stepHex = hslToHex({ h: base.h, s: saturation, l: lightness })

    return {
      step,
      hex: stepHex,
      onWhite: contrastRatio('#ffffff', stepHex),
      onBlack: contrastRatio('#000000', stepHex),
    }
  })
}
