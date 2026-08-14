export type FontMood = 'Editorial' | 'Technical' | 'Governance-Report' | 'Playful'

export const FONT_MOODS: FontMood[] = ['Editorial', 'Technical', 'Governance-Report', 'Playful']

export interface FontFace {
  family: string
  weight: number
  fallback: string
  /** Whether a variable-font file exists for this family (wght axis). */
  variable?: boolean
  /** Full weight range of the variable font, e.g. [100, 900]. */
  weightRange?: [number, number]
  /** Whether the family ships an italic variant. */
  hasItalic?: boolean
}

export interface FontPairing {
  id: string
  mood: FontMood
  heading: FontFace
  body: FontFace
  note: string
  sampleHeading: string
  sampleBody: string
}

const SANS_FALLBACK = 'ui-sans-serif, system-ui, sans-serif'
const SERIF_FALLBACK = 'ui-serif, Georgia, serif'
const MONO_FALLBACK = 'ui-monospace, SFMono-Regular, monospace'

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'fraunces-inter',
    mood: 'Editorial',
    heading: { family: 'Fraunces', weight: 700, fallback: SERIF_FALLBACK, variable: true, weightRange: [100, 900], hasItalic: true },
    body: { family: 'Inter', weight: 400, fallback: SANS_FALLBACK, variable: true, weightRange: [100, 900], hasItalic: true },
    note: 'A display serif with optical sizing against a neutral grotesque. The default answer for long-form.',
    sampleHeading: 'Design systems fail slowly, and always in the same places.',
    sampleBody:
      'Most drift is visible the moment you can read the token schema and the component inventory at once. The audit is not the hard part — acting on it is.',
  },
  {
    id: 'playfair-source-sans',
    mood: 'Editorial',
    heading: { family: 'Playfair Display', weight: 700, fallback: SERIF_FALLBACK, variable: true, weightRange: [400, 900], hasItalic: true },
    body: { family: 'Source Sans 3', weight: 400, fallback: SANS_FALLBACK, variable: true, weightRange: [200, 900], hasItalic: true },
    note: 'High-contrast didone headline over a humanist sans. Reads as fashion print at large sizes.',
    sampleHeading: 'Built for the quiet parts of the interface.',
    sampleBody:
      'Contrast ratios, deprecation notices, the accessible name of a button. Nobody photographs them, and every product depends on them.',
  },
  {
    id: 'bricolage-inclusive',
    mood: 'Editorial',
    heading: { family: 'Bricolage Grotesque', weight: 700, fallback: SANS_FALLBACK, variable: true, weightRange: [200, 800] },
    body: { family: 'Inclusive Sans', weight: 400, fallback: SANS_FALLBACK, hasItalic: true },
    note: 'The pairing this site runs on: an idiosyncratic display grotesque with a legibility-first body sans.',
    sampleHeading: 'Removing something is also a design decision.',
    sampleBody:
      'A deprecation without a migration path is a broken promise with a timestamp. Governance you cannot inspect is just an opinion.',
  },
  {
    id: 'ibm-plex-duo',
    mood: 'Technical',
    heading: { family: 'IBM Plex Sans', weight: 700, fallback: SANS_FALLBACK, hasItalic: true },
    body: { family: 'IBM Plex Mono', weight: 400, fallback: MONO_FALLBACK, hasItalic: true },
    note: 'One family, two voices. Mono body keeps code, values and prose on the same rhythm.',
    sampleHeading: 'Four buttons, all named Button.',
    sampleBody:
      'parseTokenSchema() reads the CSS custom properties directly, so the site is governed by the same parser it documents.',
  },
  {
    id: 'space-grotesk-inter',
    mood: 'Technical',
    heading: { family: 'Space Grotesk', weight: 700, fallback: SANS_FALLBACK, variable: true, weightRange: [300, 700] },
    body: { family: 'Inter', weight: 400, fallback: SANS_FALLBACK, variable: true, weightRange: [100, 900], hasItalic: true },
    note: 'Geometric display with tight tracking against a workhorse UI sans. Product-documentation default.',
    sampleHeading: 'Local first, always.',
    sampleBody:
      'A tool that reads every page you visit should not also be a network client. Nothing leaves the machine.',
  },
  {
    id: 'jetbrains-source-sans',
    mood: 'Technical',
    heading: { family: 'JetBrains Mono', weight: 700, fallback: MONO_FALLBACK, variable: true, weightRange: [100, 800], hasItalic: true },
    body: { family: 'Source Sans 3', weight: 400, fallback: SANS_FALLBACK, variable: true, weightRange: [200, 900], hasItalic: true },
    note: 'Mono headline, sans body. Signals engineering surface without making paragraphs hard work.',
    sampleHeading: 'contrast(ink, paper) = 15.94:1',
    sampleBody:
      'Every threshold in this tool is computed from the WCAG relative-luminance formula, client-side, with no rounding before the comparison.',
  },
  {
    id: 'libre-franklin-lora',
    mood: 'Governance-Report',
    heading: { family: 'Libre Franklin', weight: 700, fallback: SANS_FALLBACK, variable: true, weightRange: [100, 900], hasItalic: true },
    body: { family: 'Lora', weight: 400, fallback: SERIF_FALLBACK, variable: true, weightRange: [400, 700], hasItalic: true },
    note: 'Civic-grotesque headline over a text serif. Made for documents people are asked to sign off.',
    sampleHeading: 'Quarterly design system health report',
    sampleBody:
      'Twelve components exceeded their deprecation window. Four have no migration path recorded. Ownership is unassigned on two.',
  },
  {
    id: 'archivo-newsreader',
    mood: 'Governance-Report',
    heading: { family: 'Archivo', weight: 700, fallback: SANS_FALLBACK, variable: true, weightRange: [100, 900], hasItalic: true },
    body: { family: 'Newsreader', weight: 400, fallback: SERIF_FALLBACK, variable: true, weightRange: [200, 800], hasItalic: true },
    note: 'Condensable grotesque with a screen-first serif. Dense tables stay readable underneath.',
    sampleHeading: 'Breaking changes, by blast radius',
    sampleBody:
      'The analyzer resolves each change to the set of consumers that import it, so severity is measured in teams affected, not in files touched.',
  },
  {
    id: 'work-sans-crimson',
    mood: 'Governance-Report',
    heading: { family: 'Work Sans', weight: 700, fallback: SANS_FALLBACK, variable: true, weightRange: [100, 900], hasItalic: true },
    body: { family: 'Crimson Pro', weight: 400, fallback: SERIF_FALLBACK, variable: true, weightRange: [200, 900], hasItalic: true },
    note: 'Quiet, institutional, low-drama. Good for policy pages nobody should have to decode.',
    sampleHeading: 'Deprecation policy, version 3',
    sampleBody:
      'A component enters deprecation with a named replacement, a codemod where one is possible, and a removal date that has already been communicated.',
  },
  {
    id: 'outfit-nunito',
    mood: 'Playful',
    heading: { family: 'Outfit', weight: 700, fallback: SANS_FALLBACK, variable: true, weightRange: [100, 900] },
    body: { family: 'Nunito Sans', weight: 400, fallback: SANS_FALLBACK, variable: true, weightRange: [200, 1000], hasItalic: true },
    note: 'Rounded geometric headline, soft body sans. Warm without tipping into childish.',
    sampleHeading: 'Say hello to your new colour ramp',
    sampleBody:
      'Ten steps, contrast-checked against white and black, exportable as a Tailwind config in one click.',
  },
  {
    id: 'baloo-karla',
    mood: 'Playful',
    heading: { family: 'Baloo 2', weight: 700, fallback: SANS_FALLBACK, variable: true, weightRange: [400, 800] },
    body: { family: 'Karla', weight: 400, fallback: SANS_FALLBACK, variable: true, weightRange: [200, 800], hasItalic: true },
    note: 'Heavy rounded display with a slightly quirky grotesque body. Onboarding and empty states.',
    sampleHeading: 'Nothing here yet',
    sampleBody:
      'Pick a base colour and a ratio. The scale builds itself, and every value is copy-ready the moment it appears.',
  },
  {
    id: 'chivo-dm-sans',
    mood: 'Playful',
    heading: { family: 'Chivo', weight: 700, fallback: SANS_FALLBACK, variable: true, weightRange: [100, 900], hasItalic: true },
    body: { family: 'DM Sans', weight: 400, fallback: SANS_FALLBACK, variable: true, weightRange: [100, 1000], hasItalic: true },
    note: 'Punchy grotesque headline over a friendly low-contrast sans. Marketing pages with an edge.',
    sampleHeading: 'Ship the fix, not the finding.',
    sampleBody:
      'Every report ends in a diff you can apply. That is the whole product philosophy, compressed into one sentence.',
  },
]

export function pairingCss(pairing: FontPairing): string {
  return [
    `/* ${pairing.heading.family} + ${pairing.body.family} — ${pairing.mood} */`,
    `@import url('${googleFontsHref([pairing])}');`,
    '',
    ':root {',
    `  --font-heading: '${pairing.heading.family}', ${pairing.heading.fallback};`,
    `  --font-body: '${pairing.body.family}', ${pairing.body.fallback};`,
    '}',
    '',
    'h1, h2, h3 {',
    '  font-family: var(--font-heading);',
    `  font-weight: ${pairing.heading.weight};`,
    '}',
    '',
    'body {',
    '  font-family: var(--font-body);',
    `  font-weight: ${pairing.body.weight};`,
    '}',
  ].join('\n')
}

/** Single stylesheet request for every family in the given pairings. */
export function googleFontsHref(pairings: FontPairing[]): string {
  const families = new Map<string, Set<number>>()

  for (const pairing of pairings) {
    for (const face of [pairing.heading, pairing.body]) {
      const weights = families.get(face.family) ?? new Set<number>()
      weights.add(400)
      weights.add(face.weight)
      families.set(face.family, weights)
    }
  }

  const params = [...families.entries()]
    .map(([family, weights]) => {
      const list = [...weights].sort((a, b) => a - b).join(';')
      return `family=${family.replace(/ /g, '+')}:wght@${list}`
    })
    .join('&')

  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}
