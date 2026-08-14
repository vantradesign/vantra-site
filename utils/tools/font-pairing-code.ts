import type { FontPairing, FontFace } from './fonts'

// ---------------------------------------------------------------------------
// Options that thread through every generator
// ---------------------------------------------------------------------------

export interface CodeOptions {
  useVariable: boolean
  headingItalic: boolean
  bodyItalic: boolean
  headingWeights: number[]
  bodyWeights: number[]
}

export const STANDARD_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const

export const WEIGHT_LABELS: Record<number, string> = {
  100: 'Thin',
  200: 'Extra Light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semi Bold',
  700: 'Bold',
  800: 'Extra Bold',
  900: 'Black',
}

/** Returns weights available for a face, filtered by its weightRange if variable. */
export function availableWeights(face: FontFace): number[] {
  if (face.variable && face.weightRange) {
    return STANDARD_WEIGHTS.filter((w) => w >= face.weightRange![0] && w <= face.weightRange![1])
  }
  return [...STANDARD_WEIGHTS]
}

/** Default selected weights for a face: 400 + the pairing weight. */
export function defaultWeights(face: FontFace): number[] {
  return [...new Set([400, face.weight])].sort((a, b) => a - b)
}

export const DEFAULT_OPTIONS: CodeOptions = {
  useVariable: false,
  headingItalic: false,
  bodyItalic: false,
  headingWeights: [400, 700],
  bodyWeights: [400],
}

// ---------------------------------------------------------------------------
// Naming helpers
// ---------------------------------------------------------------------------

/** Slugify a font family name à la fontsource / Google Webfonts Helper. */
export function fontSlug(family: string): string {
  return family.toLowerCase().replace(/\s+/g, '-')
}

/** Filename for a static self-hosted woff2 file. */
export function fontFileName(family: string, weight: number, style = 'normal'): string {
  return `${fontSlug(family)}-v1-latin-${style === 'italic' ? `${weightLabel(weight)}-italic` : weightLabel(weight)}.woff2`
}

/** Filename for a variable self-hosted woff2 file. */
export function variableFontFileName(family: string, style = 'normal'): string {
  return `${fontSlug(family)}-v1-latin-variable-wghtOnly-${style}.woff2`
}

function weightLabel(weight: number): string {
  const map: Record<number, string> = {
    100: 'thin',
    200: 'extra-light',
    300: 'light',
    400: 'regular',
    500: 'medium',
    600: 'semi-bold',
    700: 'bold',
    800: 'extra-bold',
    900: 'black',
  }
  return map[weight] ?? String(weight)
}

/** CamelCase for JS variable names: "Playfair Display" → "playfairDisplay". */
function toCamelCase(family: string): string {
  return family
    .split(/[\s-]+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join('')
}

/** next/font import name: "Playfair Display" → "Playfair_Display". */
function nextFontName(family: string): string {
  return family.replace(/\s+/g, '_')
}

// ---------------------------------------------------------------------------
// Weight helpers
// ---------------------------------------------------------------------------

function resolveWeights(weights: number[]): number[] {
  return [...new Set(weights)].sort((a, b) => a - b)
}

function allWeights(pairing: FontPairing, opts: CodeOptions): { heading: number[]; body: number[] } {
  return {
    heading: resolveWeights(opts.headingWeights),
    body: resolveWeights(opts.bodyWeights),
  }
}

/** Whether variable mode is actually possible for this pairing. */
export function canUseVariable(pairing: FontPairing): boolean {
  return Boolean(pairing.heading.variable && pairing.body.variable)
}

/** Whether italic is available for the heading face. */
export function headingHasItalic(pairing: FontPairing): boolean {
  return Boolean(pairing.heading.hasItalic)
}

/** Whether italic is available for the body face. */
export function bodyHasItalic(pairing: FontPairing): boolean {
  return Boolean(pairing.body.hasItalic)
}

// ---------------------------------------------------------------------------
// Google Fonts CDN — with ital axis support
// ---------------------------------------------------------------------------

function googleFontsHrefFull(pairing: FontPairing, opts: CodeOptions): string {
  const families: string[] = []
  const w = allWeights(pairing, opts)

  for (const role of ['heading', 'body'] as const) {
    const face = pairing[role]
    const italic = role === 'heading' ? opts.headingItalic : opts.bodyItalic
    const useVar = opts.useVariable && face.variable && face.weightRange
    const weights = useVar ? [] : (role === 'heading' ? w.heading : w.body)
    const familyParam = face.family.replace(/ /g, '+')

    if (useVar && face.weightRange) {
      const range = `${face.weightRange[0]}..${face.weightRange[1]}`
      if (italic && face.hasItalic) {
        families.push(`family=${familyParam}:ital,wght@0,${range};1,${range}`)
      } else {
        families.push(`family=${familyParam}:wght@${range}`)
      }
    } else if (italic && face.hasItalic) {
      const pairs = weights.flatMap((w) => [`0,${w}`, `1,${w}`])
      families.push(`family=${familyParam}:ital,wght@${pairs.join(';')}`)
    } else {
      const list = weights.join(';')
      families.push(`family=${familyParam}:wght@${list}`)
    }
  }

  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}

export function googleFontsLinkTags(pairing: FontPairing, opts: CodeOptions = DEFAULT_OPTIONS): string {
  const href = googleFontsHrefFull(pairing, opts)
  return [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link rel="stylesheet" href="${href}">`,
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Self-hosted @font-face — static + variable + italic
// ---------------------------------------------------------------------------

function staticFontFaceBlock(family: string, weight: number, style: string, prefix: string): string {
  const file = fontFileName(family, weight, style)
  return `@font-face {
  font-display: swap;
  font-family: '${family}';
  font-style: ${style};
  font-weight: ${weight};
  src: url('${prefix}${file}') format('woff2');
}`
}

function variableFontFaceBlock(family: string, range: [number, number], style: string, prefix: string): string {
  const file = variableFontFileName(family, style)
  return `@font-face {
  font-display: swap;
  font-family: '${family}';
  font-style: ${style};
  font-weight: ${range[0]} ${range[1]};
  src: url('${prefix}${file}') format('woff2');
}`
}

function faceFontFaceBlocks(
  face: FontFace,
  italic: boolean,
  useVariable: boolean,
  prefix: string,
  weights: number[],
): string[] {
  const blocks: string[] = []
  const useVar = useVariable && face.variable && face.weightRange

  if (useVar && face.weightRange) {
    blocks.push(variableFontFaceBlock(face.family, face.weightRange, 'normal', prefix))
    if (italic && face.hasItalic) {
      blocks.push(variableFontFaceBlock(face.family, face.weightRange, 'italic', prefix))
    }
  } else {
    for (const weight of weights) {
      blocks.push(staticFontFaceBlock(face.family, weight, 'normal', prefix))
    }
    if (italic && face.hasItalic) {
      for (const weight of weights) {
        blocks.push(staticFontFaceBlock(face.family, weight, 'italic', prefix))
      }
    }
  }

  return blocks
}

export function selfHostedCss(pairing: FontPairing, prefix = '../fonts/', opts: CodeOptions = DEFAULT_OPTIONS): string {
  const w = allWeights(pairing, opts)
  const blocks = [
    ...faceFontFaceBlocks(pairing.heading, opts.headingItalic, opts.useVariable, prefix, w.heading),
    ...faceFontFaceBlocks(pairing.body, opts.bodyItalic, opts.useVariable, prefix, w.body),
  ]
  return blocks.join('\n\n')
}

// ---------------------------------------------------------------------------
// CSS custom-property + usage snippet
// ---------------------------------------------------------------------------

export function cssVariablesSnippet(pairing: FontPairing, opts: CodeOptions = DEFAULT_OPTIONS): string {
  const headingStyle = opts.headingItalic ? '\n  font-style: italic;' : ''
  const bodyStyle = opts.bodyItalic ? '\n  font-style: italic;' : ''
  return `:root {
  --font-heading: '${pairing.heading.family}', ${pairing.heading.fallback};
  --font-body: '${pairing.body.family}', ${pairing.body.fallback};
}

h1, h2, h3 {
  font-family: var(--font-heading);
  font-weight: ${pairing.heading.weight};${headingStyle}
}

body {
  font-family: var(--font-body);
  font-weight: ${pairing.body.weight};${bodyStyle}
}`
}

// ---------------------------------------------------------------------------
// Framework snippets — CDN
// ---------------------------------------------------------------------------

export function htmlCdnSnippet(pairing: FontPairing, opts: CodeOptions): string {
  return `<!-- Add to <head> -->
${googleFontsLinkTags(pairing, opts)}

<style>
${cssVariablesSnippet(pairing, opts)}
</style>`
}

export function nuxtCdnSnippet(pairing: FontPairing, opts: CodeOptions): string {
  const w = allWeights(pairing, opts)
  const hStyles = opts.headingItalic && pairing.heading.hasItalic ? `\n        styles: ['normal', 'italic'],` : ''
  const bStyles = opts.bodyItalic && pairing.body.hasItalic ? `\n        styles: ['normal', 'italic'],` : ''
  return `// nuxt.config.ts — install: npx nuxi module add fonts
export default defineNuxtConfig({
  modules: ['@nuxt/fonts'],
  fonts: {
    families: [
      {
        name: '${pairing.heading.family}',
        provider: 'google',
        weights: [${w.heading.join(', ')}],${hStyles}
      },
      {
        name: '${pairing.body.family}',
        provider: 'google',
        weights: [${w.body.join(', ')}],${bStyles}
      },
    ],
  },
})

/*
 * @nuxt/fonts downloads Google Fonts at build time and serves
 * them from your own domain — no runtime requests to Google,
 * so the GDPR concern does not apply when using this module.
 */

/* Add to your global stylesheet: */
${cssVariablesSnippet(pairing, opts)}`
}

export function nextCdnSnippet(pairing: FontPairing, opts: CodeOptions): string {
  const hVar = toCamelCase(pairing.heading.family)
  const bVar = toCamelCase(pairing.body.family)
  const hImport = nextFontName(pairing.heading.family)
  const bImport = nextFontName(pairing.body.family)
  const w = allWeights(pairing, opts)

  const hWeights = w.heading.map((n) => `'${n}'`).join(', ')
  const bWeights = w.body.map((n) => `'${n}'`).join(', ')
  const hStyle = opts.headingItalic && pairing.heading.hasItalic ? `\n  style: ['normal', 'italic'],` : ''
  const bStyle = opts.bodyItalic && pairing.body.hasItalic ? `\n  style: ['normal', 'italic'],` : ''

  return `// app/layout.tsx (Next.js 14+)
// next/font/google self-hosts fonts at build time — no
// runtime requests to Google, so no GDPR concern.
import { ${hImport}, ${bImport} } from 'next/font/google'

const ${hVar} = ${hImport}({
  subsets: ['latin'],
  weight: [${hWeights}],${hStyle}
  variable: '--font-heading',
  display: 'swap',
})

const ${bVar} = ${bImport}({
  subsets: ['latin'],
  weight: [${bWeights}],${bStyle}
  variable: '--font-body',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={\`\${${hVar}.variable} \${${bVar}.variable}\`}>
      <body>{children}</body>
    </html>
  )
}

/* Add to your global stylesheet: */
${cssVariablesSnippet(pairing, opts)}`
}

export function viteCdnSnippet(pairing: FontPairing, opts: CodeOptions): string {
  return `<!-- index.html — add to <head> -->
${googleFontsLinkTags(pairing, opts)}

/* main.css (imported in main.ts / main.js) */
${cssVariablesSnippet(pairing, opts)}`
}

export function sveltekitCdnSnippet(pairing: FontPairing, opts: CodeOptions): string {
  return `<!-- src/app.html — add to <head> -->
${googleFontsLinkTags(pairing, opts)}

/* src/app.css (imported in +layout.svelte) */
${cssVariablesSnippet(pairing, opts)}`
}

export function astroCdnSnippet(pairing: FontPairing, opts: CodeOptions): string {
  return `---
// src/layouts/Layout.astro
---
<html>
  <head>
    ${googleFontsLinkTags(pairing, opts).split('\n').join('\n    ')}
  </head>
  <body><slot /></body>
</html>

/* src/styles/global.css (imported in Layout.astro) */
${cssVariablesSnippet(pairing, opts)}`
}

// ---------------------------------------------------------------------------
// Framework snippets — self-hosted
// ---------------------------------------------------------------------------

export function htmlSelfHostedSnippet(pairing: FontPairing, prefix: string, opts: CodeOptions): string {
  return `/* Add to your global stylesheet */
${selfHostedCss(pairing, prefix, opts)}

${cssVariablesSnippet(pairing, opts)}`
}

export function nuxtSelfHostedSnippet(pairing: FontPairing, prefix: string, opts: CodeOptions): string {
  const w = allWeights(pairing, opts)
  const hStyles = opts.headingItalic && pairing.heading.hasItalic ? `\n        styles: ['normal', 'italic'],` : ''
  const bStyles = opts.bodyItalic && pairing.body.hasItalic ? `\n        styles: ['normal', 'italic'],` : ''
  return `// nuxt.config.ts — install: npx nuxi module add fonts
export default defineNuxtConfig({
  modules: ['@nuxt/fonts'],
  fonts: {
    families: [
      {
        name: '${pairing.heading.family}',
        provider: 'local',
        weights: [${w.heading.join(', ')}],${hStyles}
      },
      {
        name: '${pairing.body.family}',
        provider: 'local',
        weights: [${w.body.join(', ')}],${bStyles}
      },
    ],
  },
})

/* Place .woff2 files in public/fonts/, then add to your CSS: */
${selfHostedCss(pairing, prefix, opts)}

${cssVariablesSnippet(pairing, opts)}`
}

export function nextSelfHostedSnippet(pairing: FontPairing, prefix: string, opts: CodeOptions): string {
  const hVar = toCamelCase(pairing.heading.family)
  const bVar = toCamelCase(pairing.body.family)

  const w = allWeights(pairing, opts)

  function buildSrcArray(face: FontFace, italic: boolean, weights: number[]): string {
    if (opts.useVariable && face.variable && face.weightRange) {
      const lines = [`      { path: '${prefix}${variableFontFileName(face.family, 'normal')}', style: 'normal' },`]
      if (italic && face.hasItalic) {
        lines.push(`      { path: '${prefix}${variableFontFileName(face.family, 'italic')}', style: 'italic' },`)
      }
      return lines.join('\n')
    }
    const lines: string[] = []
    for (const wt of weights) {
      lines.push(`      { path: '${prefix}${fontFileName(face.family, wt)}', weight: '${wt}', style: 'normal' },`)
    }
    if (italic && face.hasItalic) {
      for (const wt of weights) {
        lines.push(`      { path: '${prefix}${fontFileName(face.family, wt, 'italic')}', weight: '${wt}', style: 'italic' },`)
      }
    }
    return lines.join('\n')
  }

  return `// app/layout.tsx (Next.js 14+)
import localFont from 'next/font/local'

const ${hVar} = localFont({
  src: [
${buildSrcArray(pairing.heading, opts.headingItalic, w.heading)}
  ],
  variable: '--font-heading',
  display: 'swap',
})

const ${bVar} = localFont({
  src: [
${buildSrcArray(pairing.body, opts.bodyItalic, w.body)}
  ],
  variable: '--font-body',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={\`\${${hVar}.variable} \${${bVar}.variable}\`}>
      <body>{children}</body>
    </html>
  )
}

/* Add to your global stylesheet: */
${cssVariablesSnippet(pairing, opts)}`
}

export function viteSelfHostedSnippet(pairing: FontPairing, prefix: string, opts: CodeOptions): string {
  return `/* main.css (imported in main.ts / main.js) */
${selfHostedCss(pairing, prefix, opts)}

${cssVariablesSnippet(pairing, opts)}`
}

export function sveltekitSelfHostedSnippet(pairing: FontPairing, prefix: string, opts: CodeOptions): string {
  return `/* src/app.css (imported in +layout.svelte)
   Place .woff2 files in static/fonts/ */
${selfHostedCss(pairing, prefix, opts)}

${cssVariablesSnippet(pairing, opts)}`
}

export function astroSelfHostedSnippet(pairing: FontPairing, prefix: string, opts: CodeOptions): string {
  return `/* src/styles/global.css (imported in Layout.astro)
   Place .woff2 files in public/fonts/ */
${selfHostedCss(pairing, prefix, opts)}

${cssVariablesSnippet(pairing, opts)}`
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export type DeliveryMethod = 'cdn' | 'self-hosted'
export type Framework = 'html' | 'nuxt' | 'nextjs' | 'vite' | 'sveltekit' | 'astro'

export function frameworkSnippet(
  pairing: FontPairing,
  delivery: DeliveryMethod,
  framework: Framework,
  prefix: string,
  opts: CodeOptions = DEFAULT_OPTIONS,
): string {
  if (delivery === 'cdn') {
    switch (framework) {
      case 'html': return htmlCdnSnippet(pairing, opts)
      case 'nuxt': return nuxtCdnSnippet(pairing, opts)
      case 'nextjs': return nextCdnSnippet(pairing, opts)
      case 'vite': return viteCdnSnippet(pairing, opts)
      case 'sveltekit': return sveltekitCdnSnippet(pairing, opts)
      case 'astro': return astroCdnSnippet(pairing, opts)
    }
  } else {
    switch (framework) {
      case 'html': return htmlSelfHostedSnippet(pairing, prefix, opts)
      case 'nuxt': return nuxtSelfHostedSnippet(pairing, prefix, opts)
      case 'nextjs': return nextSelfHostedSnippet(pairing, prefix, opts)
      case 'vite': return viteSelfHostedSnippet(pairing, prefix, opts)
      case 'sveltekit': return sveltekitSelfHostedSnippet(pairing, prefix, opts)
      case 'astro': return astroSelfHostedSnippet(pairing, prefix, opts)
    }
  }
}

export function copyAllCode(
  pairing: FontPairing,
  delivery: DeliveryMethod,
  framework: Framework,
  prefix: string,
  opts: CodeOptions = DEFAULT_OPTIONS,
): string {
  const parts = [
    `/* ${pairing.heading.family} + ${pairing.body.family} — ${pairing.mood} */`,
    '',
  ]

  if (delivery === 'self-hosted') {
    parts.push(selfHostedCss(pairing, prefix, opts), '')
  }

  parts.push(frameworkSnippet(pairing, delivery, framework, prefix, opts))

  return parts.join('\n')
}

// ---------------------------------------------------------------------------
// Font file list (for the download feature)
// ---------------------------------------------------------------------------

export interface FontFileEntry {
  family: string
  weight: number
  style: string
  fileName: string
}

export function fontFilesForPairing(pairing: FontPairing, opts: CodeOptions = DEFAULT_OPTIONS): FontFileEntry[] {
  const entries: FontFileEntry[] = []

  const w = allWeights(pairing, opts)

  function addFace(face: FontFace, italic: boolean, weights: number[]) {
    if (opts.useVariable && face.variable && face.weightRange) {
      entries.push({
        family: face.family,
        weight: 0,
        style: 'normal',
        fileName: variableFontFileName(face.family, 'normal'),
      })
      if (italic && face.hasItalic) {
        entries.push({
          family: face.family,
          weight: 0,
          style: 'italic',
          fileName: variableFontFileName(face.family, 'italic'),
        })
      }
    } else {
      for (const weight of weights) {
        entries.push({ family: face.family, weight, style: 'normal', fileName: fontFileName(face.family, weight) })
      }
      if (italic && face.hasItalic) {
        for (const weight of weights) {
          entries.push({ family: face.family, weight, style: 'italic', fileName: fontFileName(face.family, weight, 'italic') })
        }
      }
    }
  }

  addFace(pairing.heading, opts.headingItalic, w.heading)
  addFace(pairing.body, opts.bodyItalic, w.body)

  return entries
}
