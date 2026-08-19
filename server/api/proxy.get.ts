/**
 * Generic sub-resource proxy for the screenreader-empathy preview.
 *
 * GET /api/proxy?url=<encoded-absolute-url>
 *
 * Fetches the target URL server-side and pipes it back to the browser,
 * bypassing CORS. CSS files get their url()/@import references rewritten
 * so nested resources (fonts, background images) also route through this
 * proxy — exactly matching the demo's `/__proxy` middleware.
 */
import { rewriteCssUrls } from '../utils/proxy-rewrite'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const target = typeof query.url === 'string' ? query.url.trim() : ''

  if (!target) {
    throw createError({ statusCode: 400, statusMessage: 'Missing ?url= parameter' })
  }

  let parsed: URL
  try {
    parsed = new URL(target)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' })
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw createError({ statusCode: 400, statusMessage: 'Only http and https URLs are supported' })
  }

  try {
    const response = await fetch(target, {
      headers: { 'User-Agent': 'VantraScreenreaderEmpathy/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Upstream ${response.status}`,
      })
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    // CSS: rewrite url() / @import so nested resources also proxy
    if (contentType.includes('text/css')) {
      const css = await response.text()
      const rewritten = rewriteCssUrls(css, response.url || target)
      setResponseHeaders(event, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      })
      return rewritten
    }

    // Everything else (images, fonts, JS …): pipe through as-is
    const buffer = Buffer.from(await response.arrayBuffer())
    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    })
    return buffer
  }
  catch (err) {
    if ((err as any).statusCode) throw err
    throw createError({ statusCode: 502, statusMessage: (err as Error).message })
  }
})
