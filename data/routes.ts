import { products } from '~/data/products'
import { toolRoutes } from '~/data/tools'

/**
 * The indexable route inventory, derived from the same data the pages render
 * from. This is what the sitemap and llms.txt are built from, so a new product
 * or tool appears in both the moment it appears in `data/`.
 *
 * Deliberately not derived from Nuxt's router at build time: the router also
 * knows about the dynamic `/work/[slug]` pattern, which is not a URL, and about
 * routes we may want prerendered but not submitted. An explicit list is the one
 * that can be reviewed in a diff.
 */

/** Static routes that exist as a page file and should be indexed. */
const STATIC_ROUTES = ['/', '/work', '/tools', '/how-it-works', '/about', '/journal'] as const

/**
 * Real pages that are deliberately kept out of the sitemap.
 *
 * `/privacy` and `/imprint` stay indexable — a legal notice nobody can find is
 * worse than a thin one — but they carry no search intent, and submitting them
 * dilutes the signal of what this site is about.
 */
export const EXCLUDED_FROM_SITEMAP = ['/privacy', '/imprint'] as const

export const workRoutes = products.map((product) => `/work/${product.slug}`)

/**
 * Every URL submitted to search engines.
 *
 * No `lastmod`, `changefreq` or `priority`. Google ignores the latter two
 * outright, and a `lastmod` of "build time" is a lie that gets the whole element
 * distrusted — every URL would claim to have changed on every deploy. Reinstate
 * `lastmod` only when there is a real per-page content date to read.
 *
 * Journal articles are added in `server/routes/sitemap.xml.ts` via a content
 * collection query rather than a static import, because they live in
 * `content/journal/*.md` and are managed by `@nuxt/content`.
 */
export const sitemapRoutes: string[] = [
  ...STATIC_ROUTES,
  ...toolRoutes,
  ...workRoutes,
]
