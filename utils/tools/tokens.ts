export interface ColorToken {
  name: string
  variable: string
  hex: string
}

/**
 * Mirrors the @theme block in assets/css/main.css. Kept as literal hex values
 * because the tools compute on them client-side, where var() is opaque.
 */
export const COLOR_TOKENS: ColorToken[] = [
  { name: 'Paper', variable: '--color-paper', hex: '#f5f2f3' },
  { name: 'Ink', variable: '--color-ink', hex: '#001619' },
  { name: 'Ink muted', variable: '--color-ink-muted', hex: '#4a585a' },
  { name: 'Ink faint', variable: '--color-ink-faint', hex: '#626e70' },
  { name: 'Blue', variable: '--color-blue', hex: '#021f94' },
  { name: 'Cyan', variable: '--color-cyan', hex: '#50e8f4' },
  { name: 'Cyan soft', variable: '--color-cyan-soft', hex: '#c7f8fe' },
  { name: 'White', variable: '--color-white', hex: '#ffffff' },
]

export const BRAND_PRIMARY = '#021f94'

export const EDITORIAL_EASING = 'cubic-bezier(0.2, 0, 0, 1)'

export function tokenByHex(hex: string): ColorToken | undefined {
  return COLOR_TOKENS.find((token) => token.hex.toLowerCase() === hex.toLowerCase())
}
