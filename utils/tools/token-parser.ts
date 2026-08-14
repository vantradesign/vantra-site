import { normalizeHex, hslToRgb, rgbToHex, type Rgb, type Hsl } from './color'

// ── Types ──────────────────────────────────────────────────────────────────

export interface ParsedColorToken {
  /** Display name derived from the last path segment or variable name. */
  name: string
  /** Full path for nested tokens, e.g. ['color', 'background']. */
  path: string[]
  /** Original value as written in the file. */
  rawValue: string
  /** Normalised #rrggbb hex. */
  hex: string
  /** Source format. */
  source: 'json' | 'css'
  /** CSS selector the property was declared in (CSS only). */
  selector?: string
  /** If resolved from a var() reference, the referenced variable. */
  resolvedFrom?: string
}

export interface ParseError {
  message: string
  line?: number
}

export interface ParseResult {
  tokens: ParsedColorToken[]
  errors: ParseError[]
  warnings: string[]
}

// ── File validation ────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export function validateFile(file: File): ParseError | null {
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`,
    }
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'json' && ext !== 'css') {
    return { message: `Unsupported file type ".${ext}". Upload a .json or .css file.` }
  }

  return null
}

export function fileFormat(filename: string): 'json' | 'css' | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'json') return 'json'
  if (ext === 'css') return 'css'
  return null
}

// ── CSS named colours ──────────────────────────────────────────────────────

const CSS_NAMED_COLORS: Record<string, string> = {
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aqua: '#00ffff',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  black: '#000000',
  blanchedalmond: '#ffebcd',
  blue: '#0000ff',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgreen: '#006400',
  darkgrey: '#a9a9a9',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  gray: '#808080',
  green: '#008000',
  greenyellow: '#adff2f',
  grey: '#808080',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgreen: '#90ee90',
  lightgrey: '#d3d3d3',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  magenta: '#ff00ff',
  maroon: '#800000',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370db',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  navy: '#000080',
  oldlace: '#fdf5e6',
  olive: '#808000',
  olivedrab: '#6b8e23',
  orange: '#ffa500',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#db7093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  purple: '#800080',
  rebeccapurple: '#663399',
  red: '#ff0000',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  silver: '#c0c0c0',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  teal: '#008080',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  white: '#ffffff',
  whitesmoke: '#f5f5f5',
  yellow: '#ffff00',
  yellowgreen: '#9acd32',
}

// ── Colour format detection & normalisation ────────────────────────────────

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const RGB_RE = /^rgba?\(\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)\s*(?:[,/]\s*[\d.]+%?\s*)?\)$/i
const HSL_RE = /^hsla?\(\s*([\d.]+)(?:deg)?\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%\s*(?:[,/]\s*[\d.]+%?\s*)?\)$/i
const OKLCH_RE = /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?\s*)?\)$/i

function parseRgbChannel(raw: string): number {
  if (raw.endsWith('%')) return Math.round((parseFloat(raw) / 100) * 255)
  return Math.round(parseFloat(raw))
}

export function parseRgbString(value: string): string | null {
  const m = value.trim().match(RGB_RE)
  if (!m) return null
  const r = parseRgbChannel(m[1]!)
  const g = parseRgbChannel(m[2]!)
  const b = parseRgbChannel(m[3]!)
  if ([r, g, b].some((c) => c < 0 || c > 255 || Number.isNaN(c))) return null
  return rgbToHex({ r, g, b })
}

export function parseHslString(value: string): string | null {
  const m = value.trim().match(HSL_RE)
  if (!m) return null
  const h = parseFloat(m[1]!)
  const s = parseFloat(m[2]!)
  const l = parseFloat(m[3]!)
  if ([h, s, l].some(Number.isNaN)) return null
  const rgb = hslToRgb({ h, s, l })
  return rgbToHex(rgb)
}

/** oklch(L C H) → #rrggbb via OKLab → linear-sRGB → sRGB. */
export function parseOklchString(value: string): string | null {
  const m = value.trim().match(OKLCH_RE)
  if (!m) return null

  let L = parseFloat(m[1]!)
  if (m[1]!.endsWith('%')) L = L / 100
  const C = parseFloat(m[2]!)
  const H = parseFloat(m[3]!)

  if ([L, C, H].some(Number.isNaN)) return null

  // oklch → oklab
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  // oklab → linear sRGB (via LMS intermediary)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const lc = l_ * l_ * l_
  const mc = m_ * m_ * m_
  const sc = s_ * s_ * s_

  const rLinear = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc
  const gLinear = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc
  const bLinear = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc

  // linear sRGB → sRGB (gamma)
  function gammaEncode(c: number): number {
    if (c <= 0.0031308) return 12.92 * c
    return 1.055 * c ** (1 / 2.4) - 0.055
  }

  const r = Math.round(Math.min(255, Math.max(0, gammaEncode(rLinear) * 255)))
  const g = Math.round(Math.min(255, Math.max(0, gammaEncode(gLinear) * 255)))
  const bVal = Math.round(Math.min(255, Math.max(0, gammaEncode(bLinear) * 255)))

  return rgbToHex({ r, g, b: bVal })
}

/**
 * Returns true when the string plausibly represents a colour — hex, rgb(),
 * hsl(), oklch(), or a CSS named colour. Does not attempt full validation;
 * that happens in normalizeColorToHex.
 */
export function looksLikeColor(value: string): boolean {
  const trimmed = value.trim().toLowerCase()
  if (HEX_RE.test(trimmed)) return true
  if (RGB_RE.test(trimmed)) return true
  if (HSL_RE.test(trimmed)) return true
  if (OKLCH_RE.test(trimmed)) return true
  if (CSS_NAMED_COLORS[trimmed]) return true
  if (trimmed.startsWith('var(')) return true
  return false
}

/**
 * Normalises any recognised colour format to #rrggbb hex.
 * Returns null when the value cannot be parsed as a colour.
 */
export function normalizeColorToHex(value: string): string | null {
  const trimmed = value.trim()

  // hex
  const hex = normalizeHex(trimmed)
  if (hex) return hex

  // 8-digit hex (#rrggbbaa) — drop the alpha channel
  const hex8 = trimmed.match(/^#([0-9a-f]{8})$/i)
  if (hex8) return normalizeHex('#' + hex8[1]!.slice(0, 6))

  // rgb() / rgba()
  const rgb = parseRgbString(trimmed)
  if (rgb) return rgb

  // hsl() / hsla()
  const hsl = parseHslString(trimmed)
  if (hsl) return hsl

  // oklch()
  const oklch = parseOklchString(trimmed)
  if (oklch) return oklch

  // named CSS colour
  const named = CSS_NAMED_COLORS[trimmed.toLowerCase()]
  if (named) return named

  return null
}

// ── JSON parser ────────────────────────────────────────────────────────────

function walkJsonObject(
  obj: unknown,
  path: string[],
  tokens: ParsedColorToken[],
): void {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return

  const record = obj as Record<string, unknown>

  // W3C / Style Dictionary leaf: { "$value": "...", "$type": "color" }
  const rawValue = record['$value'] ?? record['value']
  const typeHint = record['$type'] ?? record['type']

  if (typeof rawValue === 'string') {
    // Skip tokens explicitly typed as non-colour
    if (typeof typeHint === 'string' && typeHint !== 'color') return

    const hex = normalizeColorToHex(rawValue)
    if (hex) {
      tokens.push({
        name: path[path.length - 1] ?? rawValue,
        path: [...path],
        rawValue,
        hex,
        source: 'json',
      })
    }
    return
  }

  // Group node — recurse into children. Skip metadata keys.
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith('$') || key === 'type' || key === 'description') continue

    if (typeof value === 'string') {
      // Flat map: { "primary": "#021f94" }
      const hex = normalizeColorToHex(value)
      if (hex && looksLikeColor(value)) {
        tokens.push({
          name: key,
          path: [...path, key],
          rawValue: value,
          hex,
          source: 'json',
        })
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      walkJsonObject(value, [...path, key], tokens)
    }
  }
}

export function parseJsonTokens(content: string): ParseResult {
  const tokens: ParsedColorToken[] = []
  const errors: ParseError[] = []
  const warnings: string[] = []

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch (err) {
    const message = err instanceof SyntaxError ? err.message : 'Invalid JSON'
    // Try to extract line info from the error message
    const lineMatch = message.match(/position (\d+)/)
    let line: number | undefined
    if (lineMatch) {
      const pos = parseInt(lineMatch[1]!, 10)
      line = content.slice(0, pos).split('\n').length
    }
    errors.push({ message: `JSON parse error: ${message}`, line })
    return { tokens, errors, warnings }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    errors.push({ message: 'Expected a JSON object at the root level.' })
    return { tokens, errors, warnings }
  }

  walkJsonObject(parsed, [], tokens)

  if (tokens.length === 0) {
    warnings.push(
      'No colour tokens found. The parser looks for hex (#rrggbb), rgb(), hsl(), oklch(), or named CSS colours as values.',
    )
  }

  return { tokens, errors, warnings }
}

// ── CSS parser ─────────────────────────────────────────────────────────────

const CSS_PROP_RE = /--[\w-]+\s*:\s*[^;]+/g
const CSS_BLOCK_RE = /([^{}]+?)\s*\{([^}]*)\}/g

interface RawCssDeclaration {
  variable: string
  value: string
  selector: string
  line: number
}

function extractDeclarations(content: string): RawCssDeclaration[] {
  const declarations: RawCssDeclaration[] = []

  // Reset lastIndex for global regex
  CSS_BLOCK_RE.lastIndex = 0

  let blockMatch: RegExpExecArray | null
  while ((blockMatch = CSS_BLOCK_RE.exec(content)) !== null) {
    const selector = blockMatch[1]!.trim()
    const body = blockMatch[2]!
    const blockStart = content.slice(0, blockMatch.index).split('\n').length

    // Find custom property declarations within this block
    const propRe = /(--[\w-]+)\s*:\s*([^;]+)/g
    let propMatch: RegExpExecArray | null
    while ((propMatch = propRe.exec(body)) !== null) {
      const variable = propMatch[1]!.trim()
      const value = propMatch[2]!.trim()
      const lineOffset = body.slice(0, propMatch.index).split('\n').length - 1
      declarations.push({
        variable,
        value,
        selector,
        line: blockStart + lineOffset,
      })
    }
  }

  return declarations
}

/**
 * Resolves simple var(--name) references one level deep. If a reference
 * points to another var(), it is flagged rather than recursively resolved to
 * prevent infinite loops.
 */
function resolveVarReferences(
  declarations: RawCssDeclaration[],
  tokens: ParsedColorToken[],
  warnings: string[],
): void {
  // Build lookup: variable → declaration (last write wins, like CSS)
  const byVariable = new Map<string, RawCssDeclaration>()
  for (const decl of declarations) {
    byVariable.set(decl.variable, decl)
  }

  // Build lookup: variable → already-resolved hex
  const resolvedHex = new Map<string, string>()
  for (const token of tokens) {
    if (token.selector !== undefined) {
      resolvedHex.set(`--${token.path[token.path.length - 1]}`, token.hex)
    }
  }

  // Second pass: resolve var() values
  for (const decl of declarations) {
    const varMatch = decl.value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\s*\)$/i)
    if (!varMatch) continue

    const refVar = varMatch[1]!
    const fallback = varMatch[2]?.trim()

    // Try to resolve the reference
    const refHex = resolvedHex.get(refVar)
    if (refHex) {
      tokens.push({
        name: decl.variable,
        path: [decl.variable.replace(/^--/, '')],
        rawValue: decl.value,
        hex: refHex,
        source: 'css',
        selector: decl.selector,
        resolvedFrom: refVar,
      })
      continue
    }

    // Try fallback value
    if (fallback) {
      const fallbackHex = normalizeColorToHex(fallback)
      if (fallbackHex) {
        tokens.push({
          name: decl.variable,
          path: [decl.variable.replace(/^--/, '')],
          rawValue: decl.value,
          hex: fallbackHex,
          source: 'css',
          selector: decl.selector,
          resolvedFrom: `${refVar} (fallback)`,
        })
        continue
      }
    }

    // Reference can't be resolved
    const refDecl = byVariable.get(refVar)
    if (!refDecl) {
      warnings.push(
        `${decl.variable}: references ${refVar} which is not defined in this file.`,
      )
    } else if (!looksLikeColor(refDecl.value)) {
      warnings.push(
        `${decl.variable}: references ${refVar} whose value "${refDecl.value}" does not look like a colour.`,
      )
    } else {
      warnings.push(
        `${decl.variable}: references ${refVar} which could not be resolved to a hex value.`,
      )
    }
  }
}

export function parseCssTokens(content: string): ParseResult {
  const tokens: ParsedColorToken[] = []
  const errors: ParseError[] = []
  const warnings: string[] = []

  const declarations = extractDeclarations(content)

  if (declarations.length === 0) {
    errors.push({
      message: 'Could not find any `--` custom properties. Make sure the file contains CSS custom property declarations like `--color-primary: #021f94;`.',
    })
    return { tokens, errors, warnings }
  }

  // First pass: direct colour values (non-var())
  for (const decl of declarations) {
    if (decl.value.startsWith('var(')) continue

    if (!looksLikeColor(decl.value)) continue

    const hex = normalizeColorToHex(decl.value)
    if (hex) {
      tokens.push({
        name: decl.variable,
        path: [decl.variable.replace(/^--/, '')],
        rawValue: decl.value,
        hex,
        source: 'css',
        selector: decl.selector,
      })
    }
  }

  // Second pass: resolve var() references
  resolveVarReferences(declarations, tokens, warnings)

  if (tokens.length === 0 && errors.length === 0) {
    warnings.push(
      'Found custom properties but none with recognisable colour values (hex, rgb, hsl, oklch, or named CSS colours).',
    )
  }

  return { tokens, errors, warnings }
}

// ── Main entry point ───────────────────────────────────────────────────────

export function parseTokenFile(content: string, filename: string): ParseResult {
  const format = fileFormat(filename)
  if (format === 'json') return parseJsonTokens(content)
  if (format === 'css') return parseCssTokens(content)
  return {
    tokens: [],
    errors: [{ message: `Cannot determine format for "${filename}". Use a .json or .css file.` }],
    warnings: [],
  }
}
