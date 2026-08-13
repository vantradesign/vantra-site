import { sitemapRoutes } from '~/data/routes'
import { absoluteUrl } from '~/utils/site'

/**
 * XML sitemap, generated from `data/routes.ts` so it cannot fall behind
 * `data/tools.ts` or `data/products.ts`.
 *
 * Hand-rolled instead of adding `@nuxtjs/sitemap`: the module's value is in
 * discovering routes from a CMS and managing per-URL metadata, and this site has
 * neither — the route list is two arrays in `data/`. Eleven lines of XML is
 * cheaper to audit than a dependency, and this repo's convention is to not add
 * dependencies that earn nothing (see the `@nuxtjs/supabase` removal).
 *
 * URLs are emitted with `<loc>` only; `data/routes.ts` explains why there is no
 * `lastmod`, `changefreq` or `priority`.
 */

/** XML text escaping. Nothing in the current routes needs it — that is the point. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler((event) => {
  const urls = sitemapRoutes
    .map((route) => `  <url><loc>${escapeXml(absoluteUrl(route))}</loc></url>`)
    .join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
  ].join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=0, must-revalidate')

  return `${xml}\n`
})
