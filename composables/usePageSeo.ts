import { SITE, absoluteUrl, formatTitle } from '~/utils/site'
import {
  breadcrumbNode,
  organizationNode,
  webPageNode,
  webSiteNode,
  type Crumb,
  type SchemaNode,
} from '~/utils/schema'

export interface PageSeoOptions {
  /** Page title without the site suffix — `formatTitle()` adds it. */
  title: string
  /**
   * Meta description. One or two sentences that answer what the page is, in the
   * page's own words. Not a keyword list: this is also the string an answer
   * engine sees first, and a stuffed description reads as spam to both.
   */
  description: string
  /** Trail from the root, excluding the home page — it is prepended. */
  breadcrumb?: Crumb[]
  /** Extra JSON-LD nodes merged into the page's single `@graph`. */
  schema?: SchemaNode[]
  /** Overrides the default `WebPage` primary-entity type. */
  pageType?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ContactPage'
  /**
   * Set for pages that carry no search intent (legal notices). Emits
   * `robots: noindex, follow` — the page stays reachable and its links still
   * pass, it just stops competing in the index.
   */
  noindex?: boolean
}

/**
 * The single entry point for per-page SEO. Replaces the bare `useSeoMeta()` calls
 * that every route used to make.
 *
 * What each route got before this existed: a `<title>` and a `<meta description>`.
 * What was missing on all twenty of them: a canonical URL, any Open Graph or
 * Twitter tag, and any structured data at all. Those are not per-page decisions —
 * they are derivable from the route and the two strings a page already passes —
 * so they belong in one composable rather than being pasted twenty times, which
 * is how canonicals drift.
 *
 * Deliberately *not* an app-level plugin: the title and description differ per
 * page and Open Graph needs them, so the composable has to be called where those
 * strings are known. Calling it is one line per page, and forgetting to call it
 * is visible in the page's own `<script setup>`.
 *
 * Usage:
 *
 * ```ts
 * usePageSeo({
 *   title: 'CSS clamp() Calculator',
 *   description: 'Calculate a single fluid CSS clamp() value…',
 *   breadcrumb: [{ name: 'Tools', path: '/tools' }, { name: 'CSS clamp() Calculator', path: '/tools/clamp-calculator' }],
 *   schema: [webApplicationNode({ … })],
 * })
 * ```
 */
export function usePageSeo(options: PageSeoOptions) {
  const route = useRoute()
  const url = absoluteUrl(route.path)
  const fullTitle = formatTitle(options.title)

  useSeoMeta({
    title: options.title,
    description: options.description,

    // Open Graph. `og:title` repeats the full, templated title rather than the
    // bare page title, because a share card that reads "About" with no brand is
    // indistinguishable from every other site's about page.
    ogTitle: fullTitle,
    ogDescription: options.description,
    ogUrl: url,
    ogType: 'website',
    ogSiteName: SITE.name,
    ogLocale: 'en',

    // Twitter/X. `summary`, not `summary_large_image`: there is no OG image asset
    // in public/ yet, and requesting a large-image card with no image renders as
    // a broken card. Switch to `summary_large_image` in the same commit that adds
    // the image — see docs/seo/audit-2026-08.md, issue OG-1.
    twitterCard: 'summary',
    twitterTitle: fullTitle,
    twitterDescription: options.description,

    ...(options.noindex ? { robots: 'noindex, follow' } : {}),
  })

  useHead({
    link: [{ rel: 'canonical', href: url }],
  })

  const crumbs: Crumb[] = [{ name: 'Home', path: '/' }, ...(options.breadcrumb ?? [])]
  const hasBreadcrumb = crumbs.length > 1

  const nodes: SchemaNode[] = [
    // Organization and WebSite are repeated on every page on purpose. They are
    // the entity anchor: an engine that only ever crawls one deep page still
    // learns who publishes it. The stable `@id`s mean this costs nothing —
    // consumers dedupe on them rather than inferring twenty organisations.
    organizationNode(),
    webSiteNode(),
    webPageNode({
      url,
      name: fullTitle,
      description: options.description,
      hasBreadcrumb,
      type: options.pageType,
    }),
    ...(hasBreadcrumb ? [breadcrumbNode(url, crumbs)] : []),
    ...(options.schema ?? []),
  ]

  useJsonLd(nodes)
}
