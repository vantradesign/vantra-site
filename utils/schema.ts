import { SITE, absoluteUrl } from '~/utils/site'

/**
 * JSON-LD node builders.
 *
 * Two rules govern everything in this file and neither is negotiable:
 *
 * 1. **Every field must restate something a human can see on the page.** Schema
 *    that describes content the visitor is not shown is precisely what Google's
 *    structured-data spam policy prohibits, and it is also the failure mode that
 *    gets a whole site's rich results withdrawn. So there is no `aggregateRating`
 *    (nobody has rated these tools), no `datePublished` (there is no editorial
 *    date on any page yet), and no `award`, `priceRange` or invented credentials.
 * 2. **Stable `@id`s, one `@graph` per page.** Nodes reference each other by
 *    `@id` instead of being duplicated inline, so the Organization described on
 *    the home page is the same entity as the publisher of a tool page rather
 *    than a second, near-identical company. Answer engines dedupe on `@id`;
 *    inline duplication reads as two organisations with the same name.
 *
 * The `@id` scheme is `<url>#<fragment>`, which is the convention Google's own
 * examples use and is resolvable, unlike a bare slug.
 */

/** A JSON-LD node. Loose by design — schema.org is open-ended. */
export type SchemaNode = Record<string, unknown>

export const ORGANIZATION_ID = `${absoluteUrl('/')}#organization`
export const WEBSITE_ID = `${absoluteUrl('/')}#website`
export const PERSON_ID = `${absoluteUrl('/about')}#kai-kauper`

/**
 * The publisher entity. `Organization` rather than `Corporation`: Vantra is a
 * one-person practice, not an incorporated company, and claiming otherwise in
 * markup would contradict the imprint.
 */
export function organizationNode(): SchemaNode {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE.name,
    url: absoluteUrl('/'),
    description: SITE.description,
    email: SITE.email,
    // Only profiles this site actually links to. See the note on SITE.sameAs.
    sameAs: [...SITE.sameAs],
    founder: { '@id': PERSON_ID },
    // Mirrors the visible address on /imprint, which German law (§ 5 DDG)
    // requires to be there anyway — so the markup adds no claim of its own.
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Humboldtstr. 3',
      postalCode: '71032',
      addressLocality: 'Böblingen',
      addressCountry: 'DE',
    },
  }
}

/**
 * The site entity. `WebSite` carries the site-level name and publisher; it is
 * what lets an engine attribute a page to a brand rather than to a bare domain.
 *
 * No `potentialAction`/`SearchAction`: this site has no search endpoint, and
 * declaring a sitelinks searchbox that does not exist is a broken promise Google
 * checks by fetching the URL.
 */
export function webSiteNode(): SchemaNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absoluteUrl('/'),
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.locale,
    publisher: { '@id': ORGANIZATION_ID },
  }
}

/**
 * The operator, as an entity.
 *
 * `name`, locality and the GitHub profile are all verifiable from /imprint and
 * /about. There is deliberately no `jobTitle`, `alumniOf` or `knowsAbout` list:
 * the site does not state them, so asserting them here would be fabrication —
 * and a `Person` node with three honest fields is worth more to an entity graph
 * than one with ten unverifiable ones.
 */
export function personNode(): SchemaNode {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Kai Kauper',
    url: absoluteUrl('/about'),
    email: SITE.email,
    sameAs: [...SITE.sameAs],
    worksFor: { '@id': ORGANIZATION_ID },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Böblingen',
      addressCountry: 'DE',
    },
  }
}

export interface Crumb {
  name: string
  path: string
}

/**
 * Breadcrumbs, from the site root down to the current page.
 *
 * The last item is the current page and still carries an `item` URL: Google
 * tolerates omitting it, but answer engines use the trail to understand section
 * membership, and a complete list is unambiguous.
 */
export function breadcrumbNode(url: string, crumbs: Crumb[]): SchemaNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

/**
 * The generic page node every route emits, so each URL has one primary entity
 * that the breadcrumb and publisher hang off.
 */
export function webPageNode(options: {
  url: string
  name: string
  description: string
  hasBreadcrumb?: boolean
  /** `WebPage` unless the page is genuinely a list (`CollectionPage`). */
  type?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ContactPage'
}): SchemaNode {
  const node: SchemaNode = {
    '@type': options.type ?? 'WebPage',
    '@id': `${options.url}#webpage`,
    url: options.url,
    name: options.name,
    description: options.description,
    inLanguage: SITE.locale,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
  }

  if (options.hasBreadcrumb) node.breadcrumb = { '@id': `${options.url}#breadcrumb` }

  return node
}

/**
 * A browser tool.
 *
 * `WebApplication` (a subtype of SoftwareApplication) is the accurate type: these
 * run in the page, with nothing to install. The `offers` node with `price: '0'`
 * is not marketing — it is the field Google reads to state that a tool is free,
 * and it is true of every tool here.
 *
 * `browserRequirements` says what it actually needs rather than naming browser
 * versions the site has not tested.
 */
export function webApplicationNode(options: {
  url: string
  name: string
  description: string
  /** e.g. 'DesignApplication', 'DeveloperApplication'. */
  category: string
  featureList?: string[]
}): SchemaNode {
  return {
    '@type': 'WebApplication',
    '@id': `${options.url}#app`,
    url: options.url,
    name: options.name,
    description: options.description,
    applicationCategory: options.category,
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. No account and no installation.',
    inLanguage: SITE.locale,
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    publisher: { '@id': ORGANIZATION_ID },
    ...(options.featureList?.length ? { featureList: options.featureList } : {}),
  }
}

/**
 * A published software product (the /work entries).
 *
 * `applicationCategory` is passed in rather than guessed, and `license` mirrors
 * the licence printed on the page. No `softwareVersion`: the site does not show
 * one, and a stale version string in markup is worse than none.
 */
export function softwareProductNode(options: {
  url: string
  name: string
  description: string
  license: string
  category: string
  codeRepository?: string
}): SchemaNode {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${options.url}#app`,
    url: options.url,
    name: options.name,
    description: options.description,
    applicationCategory: options.category,
    operatingSystem: 'Any',
    license: options.license,
    inLanguage: SITE.locale,
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    ...(options.codeRepository ? { codeRepository: options.codeRepository } : {}),
  }
}

export interface FaqEntry {
  question: string
  answer: string
}

/**
 * `FAQPage`, built from the questions and answers the page renders.
 *
 * Honest expectation, so nobody is surprised: Google withdrew FAQ *rich results*
 * for almost all sites in August 2023, so this will not draw an accordion into
 * the SERP. It is here because the markup is still parsed, and because it hands
 * an answer engine a pre-segmented question/answer pair per topic — which is the
 * unit an AI Overview or chat answer is assembled from. The value is extraction,
 * not decoration.
 *
 * `acceptedAnswer.text` must be the visible answer text. `answer` strings are
 * therefore taken from the same data the component renders.
 */
export function faqPageNode(url: string, entries: FaqEntry[]): SchemaNode {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  }
}

/**
 * `HowTo`-adjacent explainer content is deliberately absent: Google also retired
 * HowTo rich results, and none of these pages is a procedure. Where a page
 * explains a formula, that lives in the FAQ and the page prose instead.
 */

/**
 * A journal article.
 *
 * `datePublished` is present because the article page shows the publication
 * date — every schema field must restate something the visitor can see. `author`
 * references the Person node already anchored at /about, so an engine resolving
 * it reaches a page that is about the person rather than a stub.
 *
 * This is the first page type on the site that carries a real editorial date,
 * which is why the webPageNode rule "no datePublished" did not apply here — that
 * rule referred to pages with no visible date, and journal articles have one.
 */
export function articleNode(options: {
  url: string
  headline: string
  description: string
  datePublished: string
  dateModified?: string
}): SchemaNode {
  return {
    '@type': 'Article',
    '@id': `${options.url}#article`,
    url: options.url,
    headline: options.headline,
    description: options.description,
    inLanguage: SITE.locale,
    datePublished: options.datePublished,
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
    author: { '@id': PERSON_ID },
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf: { '@id': WEBSITE_ID },
  }
}

/** An ordered list of URLs, for the /tools and /work index pages. */
export function itemListNode(
  url: string,
  items: { name: string; path: string; description?: string }[],
): SchemaNode {
  return {
    '@type': 'ItemList',
    '@id': `${url}#list`,
    numberOfItems: items.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
      ...(item.description ? { description: item.description } : {}),
    })),
  }
}
