export interface ToolEntry {
  slug: string
  index: string
  name: string
  /** One factual line, reused as the route's meta description. */
  summary: string
  /** Editorial category shown in the index rail. */
  discipline: 'Colour' | 'Type' | 'Layout' | 'Motion' | 'Units'
}

export const tools: ToolEntry[] = [
  {
    slug: 'contrast-checker',
    index: '01',
    name: 'Contrast Checker',
    summary:
      'WCAG contrast between two colours, with the Vantra palette available as presets.',
    discipline: 'Colour',
  },
  {
    slug: 'aspect-ratio',
    index: '02',
    name: 'Aspect Ratio Calculator',
    summary: 'Ratio to dimension, dimension to ratio, and proportional resize.',
    discipline: 'Layout',
  },
  {
    slug: 'font-pairing',
    index: '03',
    name: 'Font Pairing Studio',
    summary: 'Curated typeface combinations, previewed as real editorial spreads.',
    discipline: 'Type',
  },
  {
    slug: 'type-scale',
    index: '04',
    name: 'Modular Type Scale',
    summary: 'A fluid or static typographic scale, as a specimen page. Emits clamp() per step.',
    discipline: 'Type',
  },
  {
    slug: 'spacing-scale',
    index: '05',
    name: 'Spacing Scale Generator',
    summary: 'Ten spacing tokens on a 4pt or 8pt grid, fluid or static, drawn to proportion.',
    discipline: 'Layout',
  },
  {
    slug: 'shade-tint-generator',
    index: '06',
    name: 'Shade & Tint Generator',
    summary: 'A ten-step colour ramp from one hex value, contrast-checked at every step.',
    discipline: 'Colour',
  },
  {
    slug: 'easing-curves',
    index: '07',
    name: 'Easing Curve Visualizer',
    summary: 'A cubic-bezier editor with a live preview and a keyboard-driven curve.',
    discipline: 'Motion',
  },
  {
    slug: 'unit-converter',
    index: '08',
    name: 'Unit Converter',
    summary: 'px, rem, em and pt, converted live against an adjustable root font size.',
    discipline: 'Units',
  },
  {
    slug: 'shadow-playground',
    index: '09',
    name: 'Radius & Shadow Playground',
    summary: 'Layered box-shadow and border-radius, previewed on a real content card.',
    discipline: 'Layout',
  },
  {
    slug: 'clamp-calculator',
    index: '10',
    name: 'CSS clamp() Calculator',
    summary: 'One fluid value for a one-off size, with a viewport simulator to prove it.',
    discipline: 'Units',
  },
]

export const toolRoutes = tools.map((tool) => `/tools/${tool.slug}`)

export function toolBySlug(slug: string): ToolEntry | undefined {
  return tools.find((tool) => tool.slug === slug)
}
