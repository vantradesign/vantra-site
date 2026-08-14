import { describe, it, expect } from 'vitest'
import {
  parseJsonTokens,
  parseCssTokens,
  parseTokenFile,
  normalizeColorToHex,
  parseRgbString,
  parseHslString,
  parseOklchString,
  looksLikeColor,
  validateFile,
  fileFormat,
} from './token-parser'

// ── Colour normalisation ───────────────────────────────────────────────────

describe('normalizeColorToHex', () => {
  it('normalises 6-digit hex', () => {
    expect(normalizeColorToHex('#ff0000')).toBe('#ff0000')
  })

  it('normalises 3-digit hex', () => {
    expect(normalizeColorToHex('#f00')).toBe('#ff0000')
  })

  it('normalises hex without hash', () => {
    expect(normalizeColorToHex('ff0000')).toBe('#ff0000')
  })

  it('normalises 8-digit hex (drops alpha)', () => {
    expect(normalizeColorToHex('#ff000080')).toBe('#ff0000')
  })

  it('parses rgb()', () => {
    expect(normalizeColorToHex('rgb(255, 0, 0)')).toBe('#ff0000')
  })

  it('parses rgba()', () => {
    expect(normalizeColorToHex('rgba(0, 128, 255, 0.5)')).toBe('#0080ff')
  })

  it('parses rgb() with percentage values', () => {
    expect(normalizeColorToHex('rgb(100%, 0%, 0%)')).toBe('#ff0000')
  })

  it('parses hsl()', () => {
    expect(normalizeColorToHex('hsl(0, 100%, 50%)')).toBe('#ff0000')
  })

  it('parses hsl() with deg suffix', () => {
    expect(normalizeColorToHex('hsl(120deg, 100%, 50%)')).toBe('#00ff00')
  })

  it('parses oklch()', () => {
    const hex = normalizeColorToHex('oklch(0.5 0.2 270)')
    expect(hex).toBeTruthy()
    expect(hex!.startsWith('#')).toBe(true)
    expect(hex!.length).toBe(7)
  })

  it('resolves named CSS colour', () => {
    expect(normalizeColorToHex('red')).toBe('#ff0000')
    expect(normalizeColorToHex('cornflowerblue')).toBe('#6495ed')
  })

  it('resolves named colour case-insensitively', () => {
    expect(normalizeColorToHex('Red')).toBe('#ff0000')
    expect(normalizeColorToHex('BLUE')).toBe('#0000ff')
  })

  it('returns null for non-colour strings', () => {
    expect(normalizeColorToHex('0.5rem')).toBeNull()
    expect(normalizeColorToHex('auto')).toBeNull()
    expect(normalizeColorToHex('')).toBeNull()
  })
})

describe('looksLikeColor', () => {
  it('recognises hex', () => {
    expect(looksLikeColor('#abc')).toBe(true)
    expect(looksLikeColor('#aabbcc')).toBe(true)
  })

  it('recognises rgb/hsl/oklch', () => {
    expect(looksLikeColor('rgb(1, 2, 3)')).toBe(true)
    expect(looksLikeColor('hsl(0, 100%, 50%)')).toBe(true)
    expect(looksLikeColor('oklch(0.5 0.2 270)')).toBe(true)
  })

  it('recognises named colours', () => {
    expect(looksLikeColor('red')).toBe(true)
    expect(looksLikeColor('papayawhip')).toBe(true)
  })

  it('recognises var() references', () => {
    expect(looksLikeColor('var(--color-primary)')).toBe(true)
  })

  it('rejects non-colours', () => {
    expect(looksLikeColor('16px')).toBe(false)
    expect(looksLikeColor('1rem')).toBe(false)
    expect(looksLikeColor('auto')).toBe(false)
  })
})

// ── JSON parser ────────────────────────────────────────────────────────────

describe('parseJsonTokens', () => {
  it('parses W3C Design Tokens format', () => {
    const input = JSON.stringify({
      color: {
        background: { $value: '#ffffff', $type: 'color' },
        'text-primary': { $value: '#1a1a1a', $type: 'color' },
      },
    })
    const result = parseJsonTokens(input)
    expect(result.errors).toHaveLength(0)
    expect(result.tokens).toHaveLength(2)

    const bg = result.tokens.find((t) => t.name === 'background')!
    expect(bg.hex).toBe('#ffffff')
    expect(bg.path).toEqual(['color', 'background'])

    const text = result.tokens.find((t) => t.name === 'text-primary')!
    expect(text.hex).toBe('#1a1a1a')
  })

  it('parses Style Dictionary format (no $ prefix)', () => {
    const input = JSON.stringify({
      color: {
        primary: { value: '#021f94', type: 'color' },
      },
    })
    const result = parseJsonTokens(input)
    expect(result.errors).toHaveLength(0)
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]!.hex).toBe('#021f94')
  })

  it('parses flat key→hex maps', () => {
    const input = JSON.stringify({
      primary: '#021f94',
      secondary: '#50e8f4',
    })
    const result = parseJsonTokens(input)
    expect(result.errors).toHaveLength(0)
    expect(result.tokens).toHaveLength(2)
  })

  it('skips tokens typed as non-colour', () => {
    const input = JSON.stringify({
      spacing: {
        sm: { $value: '0.5rem', $type: 'dimension' },
      },
      color: {
        ink: { $value: '#001619', $type: 'color' },
      },
    })
    const result = parseJsonTokens(input)
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]!.name).toBe('ink')
  })

  it('handles deeply nested structures', () => {
    const input = JSON.stringify({
      brand: {
        color: {
          primary: {
            base: { $value: '#021f94', $type: 'color' },
          },
        },
      },
    })
    const result = parseJsonTokens(input)
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]!.path).toEqual(['brand', 'color', 'primary', 'base'])
  })

  it('returns parse error for malformed JSON', () => {
    const result = parseJsonTokens('{ invalid json }')
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]!.message).toContain('JSON parse error')
    expect(result.tokens).toHaveLength(0)
  })

  it('returns error for non-object root', () => {
    const result = parseJsonTokens('"just a string"')
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.tokens).toHaveLength(0)
  })

  it('warns when no colour tokens found', () => {
    const input = JSON.stringify({
      spacing: { sm: { $value: '0.5rem', $type: 'dimension' } },
    })
    const result = parseJsonTokens(input)
    expect(result.tokens).toHaveLength(0)
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('supports mixed colour formats', () => {
    const input = JSON.stringify({
      a: '#ff0000',
      b: 'rgb(0, 128, 255)',
      c: 'hsl(120, 100%, 50%)',
      d: 'cornflowerblue',
    })
    const result = parseJsonTokens(input)
    expect(result.tokens).toHaveLength(4)
    expect(result.tokens[0]!.hex).toBe('#ff0000')
    expect(result.tokens[1]!.hex).toBe('#0080ff')
    expect(result.tokens[2]!.hex).toBe('#00ff00')
    expect(result.tokens[3]!.hex).toBe('#6495ed')
  })
})

// ── CSS parser ─────────────────────────────────────────────────────────────

describe('parseCssTokens', () => {
  it('parses :root custom properties', () => {
    const css = `
      :root {
        --color-primary: #021f94;
        --color-bg: #ffffff;
      }
    `
    const result = parseCssTokens(css)
    expect(result.errors).toHaveLength(0)
    expect(result.tokens).toHaveLength(2)

    const primary = result.tokens.find((t) => t.name === '--color-primary')!
    expect(primary.hex).toBe('#021f94')
    expect(primary.selector).toBe(':root')
  })

  it('parses from non-:root selectors', () => {
    const css = `
      .dark {
        --color-bg: #1a1a1a;
      }
    `
    const result = parseCssTokens(css)
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]!.selector).toBe('.dark')
  })

  it('resolves simple var() references', () => {
    const css = `
      :root {
        --color-primary: #021f94;
        --color-link: var(--color-primary);
      }
    `
    const result = parseCssTokens(css)
    expect(result.tokens).toHaveLength(2)

    const link = result.tokens.find((t) => t.name === '--color-link')!
    expect(link.hex).toBe('#021f94')
    expect(link.resolvedFrom).toBe('--color-primary')
  })

  it('warns on unresolvable var() references', () => {
    const css = `
      :root {
        --color-link: var(--color-undefined);
      }
    `
    const result = parseCssTokens(css)
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0]).toContain('--color-undefined')
  })

  it('ignores non-colour custom properties', () => {
    const css = `
      :root {
        --color-ink: #001619;
        --spacing-sm: 0.5rem;
        --radius-md: 0.375rem;
      }
    `
    const result = parseCssTokens(css)
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]!.name).toBe('--color-ink')
  })

  it('returns error when no custom properties found', () => {
    const result = parseCssTokens('body { color: red; }')
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]!.message).toContain('custom properties')
  })

  it('supports named CSS colours as values', () => {
    const css = `
      :root {
        --color-danger: crimson;
        --color-success: forestgreen;
      }
    `
    const result = parseCssTokens(css)
    expect(result.tokens).toHaveLength(2)
    expect(result.tokens[0]!.hex).toBe('#dc143c')
    expect(result.tokens[1]!.hex).toBe('#228b22')
  })

  it('resolves var() with fallback value', () => {
    const css = `
      :root {
        --color-link: var(--color-undefined, #0000ff);
      }
    `
    const result = parseCssTokens(css)
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]!.hex).toBe('#0000ff')
    expect(result.tokens[0]!.resolvedFrom).toContain('fallback')
  })
})

// ── parseTokenFile dispatcher ──────────────────────────────────────────────

describe('parseTokenFile', () => {
  it('dispatches to JSON parser for .json files', () => {
    const result = parseTokenFile('{"primary": "#ff0000"}', 'tokens.json')
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]!.source).toBe('json')
  })

  it('dispatches to CSS parser for .css files', () => {
    const result = parseTokenFile(':root { --c: #ff0000; }', 'tokens.css')
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]!.source).toBe('css')
  })

  it('returns error for unsupported file extension', () => {
    const result = parseTokenFile('something', 'tokens.txt')
    expect(result.errors.length).toBeGreaterThan(0)
  })
})

// ── File validation ────────────────────────────────────────────────────────

describe('validateFile', () => {
  it('rejects files over 5 MB', () => {
    const file = new File(['x'], 'big.json', { type: 'application/json' })
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })
    const err = validateFile(file)
    expect(err).not.toBeNull()
    expect(err!.message).toContain('too large')
  })

  it('rejects unsupported extensions', () => {
    const file = new File(['x'], 'tokens.yaml', { type: 'text/yaml' })
    const err = validateFile(file)
    expect(err).not.toBeNull()
    expect(err!.message).toContain('.yaml')
  })

  it('accepts valid .json file', () => {
    const file = new File(['{}'], 'tokens.json', { type: 'application/json' })
    expect(validateFile(file)).toBeNull()
  })

  it('accepts valid .css file', () => {
    const file = new File([':root {}'], 'tokens.css', { type: 'text/css' })
    expect(validateFile(file)).toBeNull()
  })
})

describe('fileFormat', () => {
  it('returns json for .json', () => expect(fileFormat('tokens.json')).toBe('json'))
  it('returns css for .css', () => expect(fileFormat('theme.css')).toBe('css'))
  it('returns null for unknown', () => expect(fileFormat('data.xml')).toBeNull())
})
