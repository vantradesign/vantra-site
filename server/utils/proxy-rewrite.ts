/**
 * URL-rewriting helpers for the screenreader-empathy preview proxy.
 *
 * Ported 1:1 from the `vantra-screenreader-empathy` demo's Vite config
 * so that fetched HTML renders identically inside the preview iframe on
 * the production site (images, CSS, fonts, scripts all load via proxy).
 */

const PREVIEW_VIEWPORT_H = 800

// ── Low-level helpers ──

/** Return null for URLs that must not be proxied (data:, blob:, fragments …). */
function resolveUrl(raw: string, base: string): string | null {
  const t = raw.trim()
  if (
    !t
    || t.startsWith('data:')
    || t.startsWith('blob:')
    || t.startsWith('#')
    || t.startsWith('javascript:')
    || t.startsWith('mailto:')
  )
    return null
  try {
    return new URL(t, base).href
  }
  catch {
    return null
  }
}

/** Rewrite a single URL to go through our Nitro proxy endpoint. */
function toProxyUrl(rawUrl: string, baseUrl: string): string {
  const resolved = resolveUrl(rawUrl, baseUrl)
  if (!resolved) return rawUrl
  return `/api/proxy?url=${encodeURIComponent(resolved)}`
}

// ── Unit rewriting ──

/**
 * Replace viewport-height units (vh, dvh, svh, lvh) with fixed pixel
 * equivalents so that 100vh always resolves to the simulated viewport
 * height inside the preview iframe — not to the iframe's actual
 * (auto-sized) height.
 */
export function rewriteVhUnits(text: string): string {
  return text.replace(
    /(\d+(?:\.\d+)?)\s*(vh|dvh|svh|lvh)\b/gi,
    (_m, val) => {
      const px = (parseFloat(val) / 100) * PREVIEW_VIEWPORT_H
      return `${Number.isInteger(px) ? px : px.toFixed(2)}px`
    },
  )
}

// ── CSS rewriting ──

/** Rewrite `url()`, `@import` and viewport-height units inside CSS. */
export function rewriteCssUrls(css: string, cssBaseUrl: string): string {
  css = css.replace(
    /url\(\s*(['"]?)([^)'"]+)\1\s*\)/gi,
    (_m, q, url) => `url(${q}${toProxyUrl(url, cssBaseUrl)}${q})`,
  )
  css = css.replace(
    /@import\s+(['"])([^'"]+)\1/gi,
    (_m, q, url) => `@import ${q}${toProxyUrl(url, cssBaseUrl)}${q}`,
  )
  css = rewriteVhUnits(css)
  return css
}

// ── HTML rewriting ──

/** Rewrite resource URLs in HTML so every sub-resource loads through /api/proxy. */
export function rewriteHtmlUrls(html: string, pageUrl: string): string {
  // <img|script|video|audio|source|input|embed  src="…">
  html = html.replace(
    /(<(?:img|script|video|audio|source|input|embed)\b[^>]*?\b)src\s*=\s*(['"])([^'"]*)\2/gi,
    (_m, before, q, url) => `${before}src=${q}${toProxyUrl(url, pageUrl)}${q}`,
  )

  // <video poster="…">
  html = html.replace(
    /(<video\b[^>]*?\b)poster\s*=\s*(['"])([^'"]*)\2/gi,
    (_m, before, q, url) => `${before}poster=${q}${toProxyUrl(url, pageUrl)}${q}`,
  )

  // <link href="…"> (stylesheets, favicons — NOT <a> tags)
  html = html.replace(
    /(<link\b[^>]*?\b)href\s*=\s*(['"])([^'"]*)\2/gi,
    (_m, before, q, url) => `${before}href=${q}${toProxyUrl(url, pageUrl)}${q}`,
  )

  // <object data="…">
  html = html.replace(
    /(<object\b[^>]*?\b)data\s*=\s*(['"])([^'"]*)\2/gi,
    (_m, before, q, url) => `${before}data=${q}${toProxyUrl(url, pageUrl)}${q}`,
  )

  // srcset (img, source) — comma-separated, each entry is "url [descriptor]"
  html = html.replace(
    /(<(?:img|source)\b[^>]*?\b)srcset\s*=\s*(['"])([^'"]*)\2/gi,
    (_m, before, q, srcset) => {
      const rewritten = srcset
        .split(',')
        .map((entry: string) => {
          const parts = entry.trim().split(/\s+/)
          if (parts[0]) parts[0] = toProxyUrl(parts[0], pageUrl)
          return parts.join(' ')
        })
        .join(', ')
      return `${before}srcset=${q}${rewritten}${q}`
    },
  )

  // Inline style="… url(…) …" + vh units
  html = html.replace(
    /style\s*=\s*(['"])([\s\S]*?)\1/gi,
    (_m, q, style) => {
      let rw = style.replace(
        /url\(\s*(['"]?)([^)'"]+)\1\s*\)/gi,
        (_u: string, iq: string, url: string) =>
          `url(${iq}${toProxyUrl(url, pageUrl)}${iq})`,
      )
      rw = rewriteVhUnits(rw)
      return `style=${q}${rw}${q}`
    },
  )

  // <style> blocks
  html = html.replace(
    /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (_m, open, css, close) => `${open}${rewriteCssUrls(css, pageUrl)}${close}`,
  )

  return html
}
