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
const STATIC_ROUTES = ['/', '/work', '/tools', '/how-it-works', '/about'] as const

/**
 * Real pages that are deliberately kept out of the sitemap.
 *
 * `/privacy` and `/imprint` stay indexable — a legal notice nobody can find is
 * worse than a thin one — but they carry no search intent, and submitting them
 * dilutes the signal of what this site is about.
 *
 * `/journal` is different: it is a placeholder that says the journal opens with
 * the first release. It is therefore also `noindex` (set in pages/journal/
 * index.vue), because an indexed page whose only content is a promise is thin
 * content, and thin content is assessed site-wide rather than per page.
 *
 * **Remove `/journal` from this list and delete the `noindex` in that page the
 * moment the first entry ships.** Those two edits belong in the same commit.
 */
export const EXCLUDED_FROM_SITEMAP = ['/privacy', '/imprint', '/journal'] as const

export const workRoutes = products.map((product) => `/work/${product.slug}`)

/**
 * Every URL submitted to search engines.
 *
 * No `lastmod`, `changefreq` or `priority`. Google ignores the latter two
 * outright, and a `lastmod` of "build time" is a lie that gets the whole element
 * distrusted — every URL would claim to have changed on every deploy. Reinstate
 * `lastmod` only when there is a real per-page content date to read.
 */
export const sitemapRoutes: string[] = [...STATIC_ROUTES, ...toolRoutes, ...workRoutes]
