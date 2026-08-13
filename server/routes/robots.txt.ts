import { SITE, absoluteUrl } from '~/utils/site'

/**
 * robots.txt, generated rather than hand-written so the sitemap URL cannot drift
 * from `SITE.origin`.
 *
 * The policy is deliberately permissive, including for AI crawlers. That is a
 * position, not an oversight: every tool on this site is open source and every
 * page is documentation for something we want cited. Being summarised by an
 * answer engine is the distribution channel, so blocking `GPTBot` or
 * `Google-Extended` would trade the only reach this site has for a training-data
 * objection that does not apply to content we publish under an open licence.
 *
 * Two consequences worth knowing before anyone edits this:
 *
 * - `Google-Extended` does not control crawling at all. It is a Gemini and
 *   AI-Overviews *grounding* opt-out token; disallowing it removes the site from
 *   AI Overviews while leaving classic ranking untouched. There is no reason to
 *   want that here.
 * - Blocking a crawler in robots.txt is not a privacy measure. Nothing on this
 *   site is private — there is no account area, no draft route and no
 *   user-generated content, which is why there is nothing to `Disallow`.
 *
 * If an authenticated area is ever added (server/api/README.md), it gets a
 * `Disallow` line here *and* a `noindex`, because robots.txt only stops crawling,
 * not indexing of a URL discovered elsewhere.
 */
export default defineEventHandler((event) => {
  const lines = [
    '# vantra.design — every page here is prerendered static HTML and public.',
    '# Crawling is allowed for classic search bots and AI/answer-engine crawlers',
    '# alike; see server/routes/robots.txt.ts for the reasoning.',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Nuxt build assets. Hashed, immutable and useless as search results, but',
    '# they must stay crawlable: blocking them stops Googlebot rendering the page',
    '# and breaks the mobile-friendly and Core Web Vitals assessments.',
    'Allow: /_nuxt/',
    '',
    `Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    '',
    `# Structured summary for LLM consumers: ${absoluteUrl('/llms.txt')}`,
    `# Contact: ${SITE.email}`,
  ]

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=0, must-revalidate')

  return `${lines.join('\n')}\n`
})
