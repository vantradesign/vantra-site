import { hexToRgb } from './color'

export interface ShadowLayer {
  id: number
  /** Short description, e.g. Ambient. Never just "Layer 1". */
  name: string
  x: number
  y: number
  blur: number
  spread: number
  color: string
  /** 0–100. */
  opacity: number
  inset: boolean
}

export interface ShadowPreset {
  value: string
  label: string
  radius: number
  layers: Omit<ShadowLayer, 'id'>[]
}

/**
 * Both presets are derived from the site's own surface treatment: ink at very
 * low opacity, never neutral grey, and never more than two layers.
 */
export const SHADOW_PRESETS: ShadowPreset[] = [
  {
    value: 'lifted-paper',
    label: 'Lifted paper',
    radius: 0,
    layers: [
      { name: 'Ambient', x: 0, y: 2, blur: 8, spread: 0, color: '#001619', opacity: 8, inset: false },
      { name: 'Direct', x: 0, y: 12, blur: 32, spread: -8, color: '#001619', opacity: 12, inset: false },
    ],
  },
  {
    value: 'pressed-rule',
    label: 'Pressed rule',
    radius: 2,
    layers: [
      { name: 'Hairline', x: 0, y: 1, blur: 0, spread: 0, color: '#001619', opacity: 14, inset: false },
      { name: 'Ambient', x: 0, y: 6, blur: 18, spread: -6, color: '#021f94', opacity: 10, inset: false },
    ],
  },
]

export function rgba(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgb(0 0 0 / ${opacity}%)`
  return `rgb(${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)} / ${opacity}%)`
}

export function layerToCss(layer: ShadowLayer): string {
  const parts = [
    layer.inset ? 'inset' : '',
    `${layer.x}px`,
    `${layer.y}px`,
    `${layer.blur}px`,
    `${layer.spread}px`,
    rgba(layer.color, layer.opacity),
  ].filter(Boolean)

  return parts.join(' ')
}

export function shadowToCss(layers: ShadowLayer[]): string {
  if (layers.length === 0) return 'none'
  return layers.map(layerToCss).join(', ')
}
