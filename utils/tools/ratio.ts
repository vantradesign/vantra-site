export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a))
  let y = Math.abs(Math.round(b))

  while (y) {
    const t = y
    y = x % y
    x = t
  }

  return x || 1
}

export interface Ratio {
  w: number
  h: number
}

export function reduceRatio(width: number, height: number): Ratio {
  const divisor = gcd(width, height)
  return { w: Math.round(width) / divisor, h: Math.round(height) / divisor }
}

export function formatRatioNotation({ w, h }: Ratio): string {
  return `${w}:${h}`
}

export interface AspectPreset {
  label: string
  w: number
  h: number
}

export const ASPECT_PRESETS: AspectPreset[] = [
  { label: '16:9', w: 16, h: 9 },
  { label: '9:16', w: 9, h: 16 },
  { label: '1:1', w: 1, h: 1 },
  { label: '4:5', w: 4, h: 5 },
  { label: '21:9', w: 21, h: 9 },
  { label: '4:3', w: 4, h: 3 },
]

export interface AspectReferenceEntry {
  ratio: string
  name: string
  use: string
  example: string
}

export const ASPECT_REFERENCE: AspectReferenceEntry[] = [
  { ratio: '16:9', name: 'Widescreen', use: 'Video, presentation, hero banner', example: '1920 × 1080' },
  { ratio: '9:16', name: 'Vertical', use: 'Stories, reels, mobile full screen', example: '1080 × 1920' },
  { ratio: '1:1', name: 'Square', use: 'Avatar, feed post, grid tile', example: '1080 × 1080' },
  { ratio: '4:5', name: 'Portrait', use: 'Editorial portrait, feed post', example: '1080 × 1350' },
  { ratio: '3:2', name: 'Classic 35mm', use: 'Photography, print', example: '2400 × 1600' },
  { ratio: '4:3', name: 'Standard', use: 'Legacy screen, some sensors', example: '1600 × 1200' },
  { ratio: '21:9', name: 'Cinemascope', use: 'Cinematic crop, wide hero', example: '2560 × 1097' },
  { ratio: '2:3', name: 'Editorial portrait', use: 'Magazine page, poster', example: '1600 × 2400' },
]

/** Closest named ratio, or the reduced notation when nothing is near. */
export function nameForRatio(width: number, height: number): string {
  const target = width / height
  let best: { name: string; delta: number } | null = null

  for (const entry of ASPECT_REFERENCE) {
    const [w, h] = entry.ratio.split(':').map(Number)
    if (!w || !h) continue
    const delta = Math.abs(target - w / h)
    if (!best || delta < best.delta) best = { name: entry.name, delta }
  }

  if (!best || best.delta > 0.02) return 'Custom'
  return best.name
}
