#!/usr/bin/env node
/**
 * Validate the SEO and structured-data output of a real build.
 *
 * Why this exists as a script rather than a checklist in a document: every claim
 * in this area is about the *emitted HTML*, and the emitted HTML is the one thing
 * a document cannot verify. A canonical that silently stops rendering, a JSON-LD
 * block that becomes invalid JSON because a summary gained an apostrophe, or a
 * `noindex` accidentally left on a page after launch are all invisible in review
 * and obvious here.
 *
 * Run it after `pnpm run generate`:
 *
 *   pnpm run verify:seo
 *
 * It asserts, for every prerendered page:
 *
 * - a <title>, a meta description, a self-referencing canonical, and Open Graph
 *   title/description/url
 * - at least one JSON-LD block, every block parsing as JSON, every node typed
 * - the canonical and og:url agree with each other and with the file's own path
 * - required fields are present on the node types this site emits
 * - no page is `noindex` unless it is on the expected list
 *
 * And, for the three crawler files: that they exist, are non-empty, and that the
 * sitemap contains exactly the URL set the site means to submit.
 *
 * Exit code is non-zero on any failure, so it can gate a deploy.
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const OUTPUT_DIR = '.output/public'
const ORIGIN = 'https://vantra.design'

/**
 * Pages that are expected to carry `noindex`. Anything else with a noindex is a
 * failure, and anything on this list *without* one is also a failure — the list
 * has to be wrong in only one direction to be useless.
 *
 * Keep in sync with EXCLUDED_FROM_SITEMAP in data/routes.ts and any page that
 * passes `noindex: true` to usePageSeo().
 */
const EXPECTED_NOINDEX = new Set([
  '/tools/maturity-check/check/adoption',
  '/tools/maturity-check/check/documentation',
  '/tools/maturity-check/check/governance',
  '/tools/maturity-check/check/versioning',
  '/tools/maturity-check/result',
])

const failures = []
const warnings = []

function fail(page, message) {
  failures.push(`${page}: ${message}`)
}

function warn(page, message) {
  warnings.push(`${page}: ${message}`)
}

async function* walkHtml(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walkHtml(path)
    else if (entry.name === 'index.html') yield path
  }
}

/** The route path a given output file is served at. */
function routeFor(file) {
  const rel = relative(OUTPUT_DIR, file).split(sep).slice(0, -1).join('/')
  return rel === '' ? '/' : `/${rel}`
}

function attr(html, pattern) {
  return pattern.exec(html)?.[1]
}

/**
 * Required fields per node type, checked because a node missing one of these is
 * either ignored by consumers or reported as an error by the Rich Results Test.
 */
const REQUIRED_FIELDS = {
  Organization: ['name', 'url'],
  WebSite: ['url', 'name'],
  WebPage: ['url', 'name'],
  CollectionPage: ['url', 'name'],
  AboutPage: ['url', 'name'],
  ContactPage: ['url', 'name'],
  Person: ['name'],
  BreadcrumbList: ['itemListElement'],
  WebApplication: ['name', 'applicationCategory', 'offers'],
  SoftwareApplication: ['name', 'applicationCategory'],
  FAQPage: ['mainEntity'],
  ItemList: ['itemListElement'],
}

function checkNode(page, node) {
  const type = node['@type']

  if (!type) {
    fail(page, 'JSON-LD node with no @type')
    return
  }

  for (const field of REQUIRED_FIELDS[type] ?? []) {
    if (node[field] === undefined) fail(page, `${type} is missing required field "${field}"`)
  }

  if (type === 'BreadcrumbList') {
    const positions = node.itemListElement.map((item) => item.position)
    const expected = positions.map((_, index) => index + 1)

    if (positions.join(',') !== expected.join(',')) {
      fail(page, `BreadcrumbList positions are not 1..n (got ${positions.join(',')})`)
    }
    for (const item of node.itemListElement) {
      if (!item.name || !item.item) fail(page, 'BreadcrumbList item missing name or item URL')
    }
  }

  if (type === 'FAQPage') {
    if (!node.mainEntity.length) fail(page, 'FAQPage with no questions')

    for (const question of node.mainEntity) {
      if (!question.name) fail(page, 'FAQ Question with no name')
      if (!question.acceptedAnswer?.text) fail(page, `FAQ "${question.name}" has no answer text`)
    }
  }

  if (type === 'ItemList' && node.numberOfItems !== node.itemListElement?.length) {
    fail(page, 'ItemList numberOfItems disagrees with itemListElement length')
  }
}

async function checkPage(file) {
  const route = routeFor(file)
  const html = await readFile(file, 'utf8')

  const title = attr(html, /<title[^>]*>([^<]*)<\/title>/)
  if (!title) fail(route, 'no <title>')

  const description = attr(html, /<meta name="description" content="([^"]*)"/)
  if (!description) fail(route, 'no meta description')
  else if (description.length > 165) {
    warn(route, `meta description is ${description.length} chars (will be truncated near 160)`)
  }

  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/)
  const ogUrl = attr(html, /<meta property="og:url" content="([^"]*)"/)

  if (!canonical) fail(route, 'no canonical link')
  if (!ogUrl) fail(route, 'no og:url')
  if (!attr(html, /<meta property="og:title" content="([^"]*)"/)) fail(route, 'no og:title')
  if (!attr(html, /<meta property="og:description" content="([^"]*)"/)) {
    fail(route, 'no og:description')
  }

  // The canonical has to point at this page, not at another one. A canonical
  // copied between templates is the classic way to deindex a whole section.
  const expected = route === '/' ? `${ORIGIN}/` : `${ORIGIN}${route}`
  if (canonical && canonical !== expected) {
    fail(route, `canonical is "${canonical}", expected "${expected}"`)
  }
  if (canonical && ogUrl && canonical !== ogUrl) {
    fail(route, `canonical "${canonical}" disagrees with og:url "${ogUrl}"`)
  }

  const robots = attr(html, /<meta name="robots" content="([^"]*)"/)
  const isNoindex = Boolean(robots && robots.includes('noindex'))

  if (isNoindex && !EXPECTED_NOINDEX.has(route)) {
    fail(route, `unexpected noindex ("${robots}")`)
  }
  if (!isNoindex && EXPECTED_NOINDEX.has(route)) {
    fail(route, 'expected noindex but the page is indexable')
  }

  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ]

  if (!blocks.length) {
    fail(route, 'no JSON-LD block')
    return
  }

  for (const [, raw] of blocks) {
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      fail(route, `JSON-LD is not valid JSON: ${error.message}`)
      continue
    }

    if (parsed['@context'] !== 'https://schema.org') {
      fail(route, `JSON-LD @context is "${parsed['@context']}"`)
    }
    if (!Array.isArray(parsed['@graph'])) {
      fail(route, 'JSON-LD block has no @graph array')
      continue
    }

    for (const node of parsed['@graph']) checkNode(route, node)
  }

  return route
}

/** robots.txt, sitemap.xml and llms.txt: present, non-empty, and self-consistent. */
async function checkCrawlerFiles(routes) {
  for (const name of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
    let body
    try {
      body = await readFile(join(OUTPUT_DIR, name), 'utf8')
    } catch {
      fail(name, 'file was not emitted — check nitro.prerender.routes in nuxt.config.ts')
      continue
    }

    if (body.trim() === '') fail(name, 'file is empty')

    if (name === 'robots.txt') {
      if (!body.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) {
        fail(name, 'no absolute Sitemap: line')
      }
      // A Disallow that blocks everything is the single most damaging line this
      // file can contain, so it is asserted against explicitly.
      if (/^\s*Disallow:\s*\/\s*$/m.test(body)) fail(name, 'contains a site-wide Disallow: /')
    }

    if (name === 'sitemap.xml') {
      const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

      if (!locs.length) fail(name, 'no <loc> entries')

      for (const loc of locs) {
        if (!loc.startsWith(ORIGIN)) fail(name, `<loc> is not absolute on ${ORIGIN}: ${loc}`)
      }
      if (new Set(locs).size !== locs.length) fail(name, 'contains duplicate URLs')

      // Every submitted URL must be a page that was actually built, and no
      // noindex page may be submitted. Both directions matter: the first catches
      // a sitemap promising 404s, the second catches contradictory signals.
      const built = new Set(routes.map((route) => (route === '/' ? `${ORIGIN}/` : `${ORIGIN}${route}`)))

      for (const loc of locs) {
        if (!built.has(loc)) fail(name, `submits ${loc}, which was not prerendered`)
      }
      for (const route of EXPECTED_NOINDEX) {
        if (locs.includes(`${ORIGIN}${route}`)) {
          fail(name, `submits ${route}, which is noindex`)
        }
      }
    }
  }
}

const routes = []
for await (const file of walkHtml(OUTPUT_DIR)) {
  const route = await checkPage(file)
  if (route) routes.push(route)
}

if (routes.length === 0) {
  console.error(`[seo] No pages found in ${OUTPUT_DIR}. Run \`pnpm run generate\` first.`)
  process.exit(1)
}

await checkCrawlerFiles(routes)

for (const warning of warnings) console.warn(`[seo] warn  ${warning}`)
for (const failure of failures) console.error(`[seo] FAIL  ${failure}`)

console.log(
  `\n[seo] ${routes.length} pages checked, ${failures.length} failure(s), ${warnings.length} warning(s).`,
)

process.exit(failures.length > 0 ? 1 : 0)
