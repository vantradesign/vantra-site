/**
 * Canonical site identity. One source of truth for every absolute URL the site
 * emits — canonicals, Open Graph, JSON-LD `@id`s, the sitemap and robots.txt.
 *
 * Why a module constant and not runtimeConfig: the build is `nuxt generate`, so
 * every one of these values is baked into static HTML at build time anyway.
 * Reading them from a module keeps them type-checked and available inside the
 * Nitro routes (server/routes/*) and the Vue tree without two parallel configs
 * that can silently disagree about the host — the single most common cause of
 * canonical/OG mismatch.
 *
 * If the production host ever changes, change ORIGIN here and nothing else.
 */
export const SITE = {
  origin: 'https://vantra.design',
  name: 'Vantra',
  /** Reused as the default og:description and as the Organization description. */
  description:
    'Vantra builds local-first, open-source tools for accessibility, design systems and product governance.',
  locale: 'en',
  /**
   * Verifiable, first-party profiles only. `sameAs` claiming a profile that is
   * not demonstrably the same entity is exactly what Google's structured-data
   * spam policy targets, so nothing goes in here that is not linked from the
   * site itself (SiteFooter, /about).
   */
  sameAs: ['https://github.com/vantradesign'],
  email: 'hello@vantra.design',
} as const

/**
 * Absolute URL for a route path.
 *
 * Trailing slashes are stripped so `/tools/` and `/tools` cannot both appear as
 * canonicals. The root stays `/` because an origin with no path is a different
 * URL from the origin with an empty path in some validators.
 */
export function absoluteUrl(path: string): string {
  if (!path || path === '/') return `${SITE.origin}/`

  const normalised = `/${path.replace(/^\/+/, '').replace(/\/+$/, '')}`
  return `${SITE.origin}${normalised}`
}

/**
 * The document title as it is actually rendered, brand suffix included.
 *
 * This is the same rule as `titleTemplate` in app.vue, and app.vue now calls this
 * function rather than repeating it. It has to be callable outside the head
 * template because `og:title` and `twitter:title` need the *resolved* string —
 * unhead does not apply `titleTemplate` to Open Graph tags, so a share card
 * built from the raw page title loses the brand entirely.
 */
export function formatTitle(title: string): string {
  return title === SITE.name ? SITE.name : `${title} — ${SITE.name}`
}
