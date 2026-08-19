/**
 * Proxy endpoint: fetches a URL server-side and returns its HTML with
 * all sub-resource URLs rewritten through /api/proxy.
 *
 * Used by the Screenreader Empathy tool so users can analyze any public
 * page without running into CORS restrictions. The fetch happens on the
 * server; resource URLs (img src, link href, srcset, inline style url(),
 * <style> blocks) are rewritten so the preview iframe can render the
 * page with full styling, images and fonts.
 *
 * GET /api/fetch-url?url=https://example.com
 */
import { rewriteHtmlUrls } from '../utils/proxy-rewrite'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = typeof query.url === 'string' ? query.url.trim() : ''

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing ?url= parameter' })
  }

  // Basic validation: must be http(s)
  let parsed: URL
  try {
    parsed = new URL(url)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' })
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw createError({ statusCode: 400, statusMessage: 'Only http and https URLs are supported' })
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'VantraScreenreaderEmpathy/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      throw createError({
        statusCode: 502,
        statusMessage: `Upstream returned ${response.status}`,
      })
    }

    const rawHtml = await response.text()
    const finalUrl = response.url || url
    const html = rewriteHtmlUrls(rawHtml, finalUrl)

    return { html, url: finalUrl }
  }
  catch (err) {
    if ((err as any).statusCode) throw err
    throw createError({ statusCode: 502, statusMessage: (err as Error).message })
  }
})
